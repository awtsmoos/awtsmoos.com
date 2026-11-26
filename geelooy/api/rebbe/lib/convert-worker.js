//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module RebbeConvertWorker
 * @description
 * Source of the dedicated Web Worker that runs bundle conversions for
 * the Rebbe bundle page (served at /api/rebbe/bundle/worker.js). The
 * conversion pipeline - fetch, demux, AudioDecoder -> AudioEncoder
 * (Opus), Ogg muxing - runs entirely here, never on the page's main
 * thread, so it keeps working while the tab is hidden: progress is
 * driven by codec output callbacks and queue backpressure (dequeue
 * events), not by timers that a hidden page would throttle.
 *
 * Resume insurance: each finished track's Ogg pages are persisted to
 * OPFS (sync access handles, worker-only) together with the muxer
 * continuation state. If the page is killed or reloaded mid-conversion,
 * a fresh worker picks up at the next unfinished track - finished
 * tracks are never re-downloaded or re-encoded - and the final file is
 * assembled from the stored parts. The store is cleared after the page
 * acknowledges a successful save, and on Cancel.
 *
 * The worker body is a real function serialized with toString(); the
 * shared engine (ENGINE_JS: demuxers, muxer, resampler) is prepended,
 * so worker and page run the exact same conversion code.
 */

const { ENGINE_JS } = require("./engine.js");

/* eslint-disable no-undef */
function rebbeConvertWorkerMain() {
	'use strict';

	const post = msg => self.postMessage(msg);
	const state = { running: false, cancelled: false, skip: false, key: '' };

	class Declined extends Error {}
	class Cancelled extends Error {}
	class SkipTrack extends Error {}

	/** Sniffs MP3 magic: an ID3 tag, or an MPEG frame sync with a real layer. */
	function sniffIsMp3(bytes) {
		if (bytes.length >= 3 && bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) return true;
		if (bytes.length >= 2 && bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0) return ((bytes[1] >> 1) & 0x03) !== 0;
		return false;
	}
	function fmtBytes(n) {
		if (!n) return '0 MB';
		return n >= 1e9 ? (n / 1e9).toFixed(2) + ' GB' : (n / 1e6).toFixed(1) + ' MB';
	}
	/** Rejects if a stage runs longer than ms - a stall becomes an error, not a freeze. */
	function withTimeout(promise, ms, label) {
		return Promise.race([promise, new Promise((_, reject) =>
			setTimeout(() => reject(new Error(label + ' timed out after ' + Math.round(ms / 1000) + 's - the device or network may be very slow')), ms))]);
	}
	function checkInterrupt() {
		if (state.cancelled) throw new Cancelled('Conversion cancelled.');
		if (state.skip) throw new SkipTrack('skipped');
	}
	/** Races a stage promise against the Skip / Cancel controls. */
	function raceInterrupt(promise) {
		return Promise.race([promise, new Promise((_, reject) => {
			const iv = setInterval(() => {
				if (state.skip) { clearInterval(iv); reject(new SkipTrack('skipped')); }
				else if (state.cancelled) { clearInterval(iv); reject(new Cancelled('Conversion cancelled.')); }
			}, 100);
			promise.then(() => clearInterval(iv), () => clearInterval(iv));
		})]);
	}
	/**
	 * Waits until a codec queue drains to max. Driven by the codec's own
	 * dequeue event / output flow; the slow poll is only a backstop for
	 * browsers without dequeue events - progress never depends on it.
	 */
	function waitQueueOnce(codec, getSize, max) {
		if (getSize() <= max) return Promise.resolve();
		return new Promise(resolve => {
			let done = false;
			const finish = () => { if (!done) { done = true; resolve(); } };
			try { codec.ondequeue = finish; } catch (e) {}
			const iv = setInterval(() => { if (getSize() <= max) { clearInterval(iv); finish(); } }, 25);
			setTimeout(() => { clearInterval(iv); finish(); }, 3000);
		});
	}
	async function drainQueue(codec, getSize, max) {
		while (getSize() > max) { checkInterrupt(); await waitQueueOnce(codec, getSize, max); }
	}

	/** Feature-detects WebCodecs inside the worker (same probe as the page). */
	async function probe() {
		const support = { available: false, opusEncode: false, decoders: {}, reason: '' };
		try {
			if (!self.isSecureContext) { support.reason = 'not a secure context'; return support; }
			if (typeof AudioEncoder === 'undefined' || typeof AudioDecoder === 'undefined') {
				support.reason = 'WebCodecs (AudioEncoder/AudioDecoder) is not available in this browser';
				return support;
			}
			support.available = true;
			const combos = [
				{ codec: 'opus', sampleRate: 48000, numberOfChannels: 2, bitrate: 128000 },
				{ codec: 'opus', sampleRate: 48000, numberOfChannels: 1, bitrate: 96000 }
			];
			for (const cfg of combos) {
				try { if ((await AudioEncoder.isConfigSupported(cfg)).supported) { support.opusEncode = true; break; } } catch (e) {}
			}
			for (const codec of ['opus', 'mp3']) {
				try {
					support.decoders[codec] = !!(await AudioDecoder.isConfigSupported({
						codec, sampleRate: codec === 'opus' ? 48000 : 44100, numberOfChannels: 2
					})).supported;
				} catch (e) { support.decoders[codec] = false; }
			}
			if (!support.opusEncode) support.reason = 'AudioEncoder has no Opus encoder in this browser';
		} catch (e) { support.reason = 'WebCodecs probe failed: ' + e.message; }
		return support;
	}

	/* ================= OPFS track store (sync handles) ================= */

	const STORE_PREFIX = 'rebbe-convert-';
	async function openStore(key, create) {
		if (!navigator.storage || !navigator.storage.getDirectory) return null;
		try {
			const root = await navigator.storage.getDirectory();
			const dir = await root.getDirectoryHandle(STORE_PREFIX + key, { create: !!create });
			return { root, dir };
		} catch (e) { return null; }
	}
	// OPFS sync access handles are worker-only; the async handle dance is
	// done once per file, the byte movement itself is synchronous.
	async function readStoredBytes(dir, name) {
		let access = null;
		try {
			const fh = await dir.getFileHandle(name, { create: false });
			access = await fh.createSyncAccessHandle();
			const size = access.getSize();
			if (!size) return new Uint8Array(0);
			const buf = new Uint8Array(size);
			access.read(buf, { at: 0 });
			return buf;
		} catch (e) { return null; }
		finally { if (access) { try { access.close(); } catch (e) {} } }
	}
	async function writeStoredBytes(dir, name, bytes) {
		let access = null;
		const fh = await dir.getFileHandle(name, { create: true });
		access = await fh.createSyncAccessHandle();
		try {
			access.truncate(0);
			access.write(bytes, { at: 0 });
			access.flush();
		} finally { try { access.close(); } catch (e) {} }
	}
	async function storedSize(dir, name) {
		let access = null;
		try {
			const fh = await dir.getFileHandle(name, { create: false });
			access = await fh.createSyncAccessHandle();
			return access.getSize();
		} catch (e) { return 0; }
		finally { if (access) { try { access.close(); } catch (e) {} } }
	}
	async function readMeta(store) {
		if (!store) return null;
		const data = await readStoredBytes(store.dir, 'meta.json');
		if (!data || !data.length) return null;
		try { return JSON.parse(new TextDecoder().decode(data)); } catch (e) { return null; }
	}
	async function writeMeta(store, meta) {
		if (!store) return;
		await writeStoredBytes(store.dir, 'meta.json', new TextEncoder().encode(JSON.stringify(meta)));
	}
	async function clearStore(key) {
		try {
			const root = await navigator.storage.getDirectory();
			await root.removeEntry(STORE_PREFIX + key, { recursive: true });
		} catch (e) {}
	}

	/* ================= Fetch with progress + idle watchdog ================= */

	const FETCH_IDLE_MS = 60000;
	let lastProgressAt = 0;
	let lastProgressFrac = -1;
	function postProgress(done, total, label, force) {
		const now = Date.now();
		if (!force && now - lastProgressAt < 200 && Math.abs(done - lastProgressFrac) < 0.005) return;
		lastProgressAt = now;
		lastProgressFrac = done;
		post({ type: 'progress', done, total, label });
	}
	async function fetchBlobFrom(url, file, i, total) {
		const ctrl = new AbortController();
		let idle = setTimeout(() => ctrl.abort(), FETCH_IDLE_MS);
		try {
			const res = await fetch(url, { signal: ctrl.signal });
			if (!res.ok) throw new Error('HTTP ' + res.status);
			if (!res.body || !res.body.getReader) return await res.blob();
			const reader = res.body.getReader();
			const parts = [];
			let received = 0;
			for (;;) {
				checkInterrupt();
				const { done, value } = await reader.read();
				if (done) break;
				clearTimeout(idle); idle = setTimeout(() => ctrl.abort(), FETCH_IDLE_MS);
				parts.push(value); received += value.length;
				const frac = file.size ? Math.min(1, received / file.size) : 0;
				postProgress(i + frac, total, 'Fetching for conversion ' + (i + 1) + ' of ' + total + ': ' + file.name + ' - ' + fmtBytes(received) + (file.size ? ' of ' + fmtBytes(file.size) : ''));
			}
			return new Blob(parts);
		} catch (e) {
			if (e && e.name === 'AbortError') throw new Error('download stalled (no data for ' + Math.round(FETCH_IDLE_MS / 1000) + 's)');
			throw e;
		} finally { clearTimeout(idle); }
	}
	async function fetchTrack(file, i, total) {
		const urls = [file.directUrl, file.downloadUrl].filter(Boolean);
		let lastError = null;
		for (const url of urls) {
			try { return await fetchBlobFrom(url, file, i, total); }
			catch (e) { if (e instanceof SkipTrack || e instanceof Cancelled) throw e; lastError = e; }
		}
		throw new Error('Could not fetch ' + file.name + ' (' + (lastError && lastError.message) + ')');
	}

	function concatParts(parts) {
		let len = 0;
		for (const p of parts) len += p.length;
		const out = new Uint8Array(len);
		let o = 0;
		for (const p of parts) { out.set(p, o); o += p.length; }
		return out;
	}

	/* ================= The conversion run ================= */

	async function runConversion(msg) {
		const files = msg.files;
		const total = files.length;
		state.key = msg.key;
		state.cancelled = false;
		state.skip = false;
		const support = await probe();
		post({ type: 'probe', support });
		if (!support.opusEncode) {
			post({ type: 'declined', reason: support.reason || 'no WebCodecs Opus encoder in this browser' });
			return;
		}
		let store = await openStore(msg.key, true);
		let meta = await readMeta(store);
		const doneList = [];
		const skippedList = [];
		let muxerState = null;
		let outFrames = 0;
		let totalSeconds = 0;
		let resumed = false;
		if (meta && meta.engine === 'webcodecs-opus' && meta.total === total && !meta.complete
			&& Array.isArray(meta.done) && (meta.done.length || (meta.skipped || []).length)) {
			for (const i of meta.done) doneList.push(i);
			for (const i of (meta.skipped || [])) skippedList.push(i);
			muxerState = meta.muxerState || null;
			outFrames = meta.outFrames || 0;
			totalSeconds = meta.totalSeconds || 0;
			resumed = doneList.length > 0 || skippedList.length > 0;
		} else if (meta) {
			await clearStore(msg.key);
			store = await openStore(msg.key, true);
			meta = null;
		}
		let encodedBytes = 0;
		if (store) for (const i of doneList) encodedBytes += await storedSize(store.dir, 'track-' + i + '.bin');
		post({ type: 'started', resumed, doneTracks: doneList.length, total });

		let encoder = null;
		let muxer = null;
		let encChannels = 0;
		let encError = null;
		let feedError = null;
		let feedChain = Promise.resolve();
		const ensureMuxer = channels => {
			if (muxer) return;
			encChannels = channels;
			muxer = createOggOpusMuxer(channels, muxerState || undefined);
		};
		const ensureEncoder = () => {
			if (encoder) return;
			encError = null;
			encoder = new AudioEncoder({
				output: chunk => {
					const buf = new ArrayBuffer(chunk.byteLength);
					chunk.copyTo(buf);
					muxer.writePacket(new Uint8Array(buf), chunk.duration || 0);
				},
				error: e => { encError = e; }
			});
			encoder.configure({ codec: 'opus', sampleRate: 48000, numberOfChannels: encChannels, bitrate: encChannels === 2 ? 128000 : 96000 });
		};
		const closeEncoder = async flushIt => {
			if (!encoder) return;
			const enc = encoder;
			encoder = null;
			if (flushIt) { try { await enc.flush(); } catch (e) {} }
			try { enc.close(); } catch (e) {}
		};
		const feedBlock = async block => {
			await drainQueue(encoder, () => encoder.encodeQueueSize, 8);
			if (encError) throw encError;
			const ad = blockToAudioData(block, Math.round(outFrames * 1e6 / 48000));
			outFrames += block.frames;
			encoder.encode(ad);
		};
		const saveMetaNow = async complete => {
			if (!store) return;
			await writeMeta(store, {
				engine: 'webcodecs-opus', total,
				done: doneList.slice(), skipped: skippedList.slice(),
				muxerState: muxer ? muxer.getState() : muxerState,
				outFrames, totalSeconds, channels: encChannels, complete: !!complete
			});
		};

		state.running = true;
		try {
			for (let i = 0; i < total; i++) {
				if (doneList.includes(i) || skippedList.includes(i)) continue;
				if (state.cancelled) throw new Cancelled('Conversion cancelled.');
				state.skip = false;
				const file = files[i];
				const snap = muxer ? { muxer: muxer.snapshot(), outFrames } : null;
				let decoder = null;
				try {
					const blob = await raceInterrupt(fetchTrack(file, i, total));
					postProgress(i, total, 'Converting ' + (i + 1) + ' of ' + total + ': ' + file.name + ' - decoding (native media encoder)...', true);
					const bytes = new Uint8Array(await blob.arrayBuffer());
					let demuxed, decConfig, codec;
					if (bytes.length >= 4 && bytes[0] === 0x4f && bytes[1] === 0x67 && bytes[2] === 0x67 && bytes[3] === 0x53) {
						const d = demuxOggOpus(bytes);
						if (!d.head || !d.packets.length) throw new Declined('could not demux the Ogg/Opus file ' + file.name);
						demuxed = d;
						codec = 'opus';
						decConfig = { codec: 'opus', sampleRate: 48000, numberOfChannels: d.channels, description: d.head };
					} else if (sniffIsMp3(bytes.subarray(0, 4))) {
						const d = splitMp3Frames(bytes);
						if (!d.packets.length) throw new Declined('could not split the MP3 file ' + file.name + ' into frames');
						demuxed = d;
						codec = 'mp3';
						decConfig = { codec: 'mp3', sampleRate: d.sampleRate, numberOfChannels: d.channels };
					} else {
						throw new Declined('format of ' + file.name + ' needs the fallback converter');
					}
					if (support.decoders[codec] === false) throw new Declined('no WebCodecs decoder for ' + codec + ' in this browser');
					const expectedUs = file.duration ? file.duration * 1e6 : demuxed.durationUs;
					let decodedUs = 0;
					let decError = null;
					let resampler = null;
					decoder = new AudioDecoder({
						output: ad => {
							decodedUs = Math.max(decodedUs, ad.timestamp + (ad.duration || 0));
							const frac = expectedUs ? Math.min(1, decodedUs / expectedUs) : 0;
							postProgress(i + frac, total, 'Converting ' + (i + 1) + ' of ' + total + ': ' + file.name + ' - ' + Math.round(frac * 100) + '% - Opus so far ' + fmtBytes(encodedBytes + (muxer ? muxer.bytesWritten : 0)) + ' (native media encoder)');
							feedChain = feedChain.then(async () => {
								if (feedError) { try { ad.close(); } catch (e) {} return; }
								try {
									checkInterrupt();
									ensureMuxer(Math.min(2, Math.max(1, ad.numberOfChannels)));
									ensureEncoder();
									if (!resampler) resampler = createResampler48000(ad.sampleRate, ad.numberOfChannels, encChannels);
									const blocks = [];
									resampler.push(audioDataToPlanar(ad), ad.numberOfFrames, blocks);
									for (const block of blocks) await feedBlock(block);
								} catch (e) { feedError = e; }
								try { ad.close(); } catch (e) {}
							});
						},
						error: e => { decError = e; }
					});
					decoder.configure(decConfig);
					const feedAll = (async () => {
						for (const pkt of demuxed.packets) {
							checkInterrupt();
							if (decError) throw decError;
							await drainQueue(decoder, () => decoder.decodeQueueSize, 16);
							decoder.decode(new EncodedAudioChunk({ type: 'key', timestamp: pkt.timestamp, duration: pkt.duration, data: pkt.data }));
						}
						await withTimeout(decoder.flush(), 180000, 'Decoding ' + file.name);
						await feedChain;
						if (decError) throw decError;
						if (feedError) throw feedError;
						if (encError) throw encError;
						if (resampler) {
							const tail = [];
							resampler.flush(tail);
							for (const block of tail) await feedBlock(block);
							if (encError) throw encError;
						}
					})();
					await raceInterrupt(feedAll);
					if (decodedUs === 0) throw new Error('Decoding ' + file.name + ' produced no audio');
					// Track boundary: drain the encoder, page-align the
					// muxer, and persist this track's Ogg pages + the
					// continuation state before moving on.
					await closeEncoder(true);
					muxer.flushPage();
					const trackBytes = concatParts(muxer.takeParts());
					if (store) await writeStoredBytes(store.dir, 'track-' + i + '.bin', trackBytes);
					encodedBytes += trackBytes.length;
					totalSeconds += decodedUs / 1e6;
					doneList.push(i);
					await saveMetaNow(false);
					post({ type: 'track-done', index: i, total, totalSeconds, encodedBytes });
				} catch (trackError) {
					if (trackError instanceof SkipTrack) {
						// Roll the stream back to the track boundary: the
						// skipped track contributes nothing to the file.
						await closeEncoder(false);
						feedError = null;
						feedChain = Promise.resolve();
						if (muxer && snap) { muxer.restore(snap.muxer); outFrames = snap.outFrames; }
						else if (muxer) { muxer = null; outFrames = 0; }
						skippedList.push(i);
						await saveMetaNow(false);
						postProgress(i + 1, total, 'Skipped ' + file.name + ' - continuing with the next track...', true);
						continue;
					}
					throw trackError;
				} finally {
					if (decoder) { try { decoder.close(); } catch (e) {} }
				}
			}
			if (state.cancelled) throw new Cancelled('Conversion cancelled.');
			if (!doneList.length) throw new Error('Every track was skipped - nothing to save.');
			postProgress(1, 1, 'Finishing Opus file...', true);
			await closeEncoder(true);
			if (encError) throw encError;
			if (muxer) {
				const eosBytes = concatParts(muxer.finish());
				if (store) await writeStoredBytes(store.dir, 'eos.bin', eosBytes);
			}
			await saveMetaNow(true);
			const assembled = await assembleFromStore(msg.key, total);
			if (!assembled) throw new Error('Converted parts could not be assembled.');
			post({
				type: 'done', blob: assembled, totalSeconds,
				converted: doneList.length, total, skipped: skippedList.length, resumed
			});
		} catch (e) {
			await closeEncoder(false);
			if (e instanceof Cancelled) {
				await clearStore(msg.key);
				post({ type: 'cancelled' });
			} else if (e instanceof Declined) {
				await clearStore(msg.key);
				post({ type: 'declined', reason: e.message });
			} else {
				post({ type: 'error', message: e && e.message ? e.message : String(e) });
			}
		} finally {
			state.running = false;
		}
	}

	/** Assembles the final .opus Blob from the persisted per-track parts. */
	async function assembleFromStore(key, total) {
		const store = await openStore(key, false);
		if (!store) return null;
		const meta = await readMeta(store);
		if (!meta || !meta.complete) return null;
		const parts = [];
		const done = (meta.done || []).slice().sort((a, b) => a - b);
		for (const i of done) {
			const bytes = await readStoredBytes(store.dir, 'track-' + i + '.bin');
			if (!bytes) return null;
			parts.push(bytes);
		}
		const eos = await readStoredBytes(store.dir, 'eos.bin');
		if (eos) parts.push(eos);
		return new Blob(parts, { type: 'audio/ogg' });
	}

	self.onmessage = async e => {
		const msg = e.data || {};
		try {
			if (msg.type === 'start') {
				if (state.running) return;
				await runConversion(msg);
			} else if (msg.type === 'skip') {
				state.skip = true;
			} else if (msg.type === 'cancel') {
				state.cancelled = true;
				if (!state.running && msg.key) { await clearStore(msg.key); post({ type: 'cancelled' }); }
			} else if (msg.type === 'assemble') {
				const blob = await assembleFromStore(msg.key, msg.total);
				if (blob) {
					const store = await openStore(msg.key, false);
					const meta = await readMeta(store);
					post({
						type: 'done', blob, totalSeconds: meta ? (meta.totalSeconds || 0) : 0,
						converted: meta && meta.done ? meta.done.length : 0,
						total: msg.total, skipped: meta && meta.skipped ? meta.skipped.length : 0,
						resumed: true, assembledFromStore: true
					});
				} else {
					post({ type: 'error', message: 'No completed conversion is stored for this bundle.' });
				}
			} else if (msg.type === 'ack-saved') {
				if (msg.key) await clearStore(msg.key);
			} else if (msg.type === 'clear') {
				if (msg.key) await clearStore(msg.key);
			}
		} catch (err) {
			post({ type: 'error', message: err && err.message ? err.message : String(err) });
		}
	};

	// Heartbeat: lets the page distinguish a live-but-quiet worker (long
	// track on a slow network) from a dead one. It carries no progress
	// and drives nothing - conversion advances on codec callbacks.
	setInterval(() => { if (state.running) post({ type: 'heartbeat' }); }, 10000);
	post({ type: 'ready' });
}
/* eslint-enable no-undef */

const CONVERT_WORKER_JS = ENGINE_JS + "\n;\n(" + rebbeConvertWorkerMain.toString() + ")();\n";

module.exports = { CONVERT_WORKER_JS };
