//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module RebbeApiPage
 * @description
 * Human pages for the Rebbe sichos API: the bundle landing page an agent
 * hands to an end user, and the API documentation page. The bundle page
 * does the heavy lifting in the browser, reusing the front end's own
 * vessels: modules/zip-store.js (makeZip) for the ZIP and modules/download/
 * farbrengen/mp3-join.js (joinMp3Blobs) for the lossless merged MP3. When a
 * bundle is not all true MP3, the page converts instead - in the browser,
 * never on the server: primarily with the native media encoder (WebCodecs
 * AudioDecoder -> AudioEncoder, feature-detected, streamed chunk by chunk)
 * producing one merged Opus file muxed into Ogg in-page (Chrome's media
 * encoder has no MP3 encoder at all - Opus is what it offers, and Hai's
 * ruling 2026-11-26 accepts Opus for converted bundles), falling back to
 * Web Audio decoding one track at a time into the vendored lamejs MP3
 * encoder (modules/download/lame.min.js, loaded lazily) on browsers with
 * no WebCodecs - memory-bounded either way, no WAV.
 */

const { API_VERSION } = require("./response.js");

const STYLE = `
:root{--gold:#d59a35;--gold-soft:#f3d489;--bg:#171008;--panel:#241708;--panel2:#2e1e0b;--text:#f7ead0;--muted:#c9ab72;--line:#5a3d14}
*{box-sizing:border-box}body{margin:0;background:radial-gradient(1200px 600px at 50% -10%,#3a2708,var(--bg));color:var(--text);font-family:Georgia,'Times New Roman',serif;min-height:100vh}
.wrap{max-width:860px;margin:0 auto;padding:32px 20px 64px}
h1{font-size:30px;margin:8px 0 4px;color:var(--gold-soft);letter-spacing:.5px}
h2{color:var(--gold-soft);margin-top:36px}
.sub{color:var(--muted);margin:0 0 20px}
.card{background:linear-gradient(180deg,var(--panel2),var(--panel));border:1px solid var(--line);border-radius:14px;padding:20px;margin:16px 0;box-shadow:0 8px 30px rgba(0,0,0,.35)}
.btn{display:inline-block;background:linear-gradient(180deg,#e8b34b,var(--gold));color:#241703;border:none;font-weight:700;font-size:16px;padding:13px 22px;border-radius:10px;cursor:pointer;margin:6px 8px 6px 0;text-decoration:none;font-family:inherit}
.btn.secondary{background:transparent;color:var(--gold-soft);border:1px solid var(--gold)}
.btn:disabled{opacity:.45;cursor:wait}
.progress{height:10px;background:#120b04;border-radius:6px;overflow:hidden;margin:12px 0;display:none}
.progress>div{height:100%;width:0;background:linear-gradient(90deg,var(--gold),var(--gold-soft));transition:width .2s}
.status{color:var(--muted);min-height:20px;font-size:14px}
table{width:100%;border-collapse:collapse;font-size:14px}
td,th{padding:7px 8px;border-bottom:1px solid var(--line);text-align:left;vertical-align:top}
th{color:var(--gold-soft)}
code{background:#120b04;padding:2px 6px;border-radius:5px;color:var(--gold-soft);font-size:13px;word-break:break-all}
pre{background:#120b04;padding:14px;border-radius:10px;overflow:auto;font-size:13px}
a{color:var(--gold-soft)}
.totals{display:flex;gap:22px;flex-wrap:wrap;color:var(--muted)}
.totals b{color:var(--text);font-size:18px}
.err{color:#ff9c7a}
`;

/** Escapes text for HTML contexts. */
function esc(value) {
	return String(value ?? "").replace(/[&<>"']/g, ch => ({
		"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
	}[ch]));
}

/**
 * Renders the bundle landing page. All data loads client-side from the
 * manifest endpoint, so this page is a static shell keyed by ?id=.
 * @param {string} base Public API base path.
 * @returns {string} HTML document.
 */
function bundlePage(base) {
	return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Sichos Bundle — Awtsmoos Rebbe Archive</title>
<style>${STYLE}</style>
</head>
<body>
<div class="wrap">
	<p class="sub">B"H · Awtsmoos Rebbe Archive</p>
	<h1 id="title">Loading bundle…</h1>
	<p class="sub" id="subtitle"></p>
	<div class="card">
		<div class="totals" id="totals"></div>
		<div style="margin-top:14px">
			<button class="btn" id="btn-zip" disabled>Download ZIP (in browser)</button>
			<button class="btn" id="btn-merge" disabled>Download merged audio (in browser)</button>
			<button class="btn secondary" id="btn-cancel" style="display:none">Cancel conversion</button>
			<button class="btn secondary" id="btn-skip" style="display:none">Skip this track</button>
			<button class="btn secondary" id="btn-retry" style="display:none">Retry</button>
		</div>
		<div class="progress" id="progress"><div></div></div>
		<p class="status" id="status"></p>
		<p class="status">ZIP and the merged file are assembled on your device from the original Archive.org files - the server never downloads or converts anything. When every file is a true MP3, the merged file is an <b>MP3</b>: the original frames joined losslessly, exactly like the Rebbe app itself. Some files in this archive are other formats carrying an .mp3 name (e.g. Opus); those bundles are <b>converted right here in your browser</b> into one merged <b>Opus</b> file (.opus) with your browser's native media encoder - near-instant, one file at a time, so even a many-hour bundle stays light. (Browsers without the native encoder fall back to a slower built-in MP3 conversion.) The ZIP always keeps every original file unchanged.</p>
	</div>
	<div class="card">
		<h2 style="margin-top:0">Contents</h2>
		<table><thead><tr><th>#</th><th>Sicha</th><th>Date</th><th>Files</th><th>Size</th></tr></thead><tbody id="rows"></tbody></table>
	</div>
	<p class="sub">From the <a href="/apps/rebbe/">Rebbe Archive app</a> · API v${API_VERSION} · <a href="${base}/docs">API documentation</a></p>
</div>
<script type="module">
const BASE = ${JSON.stringify(base)};
const params = new URLSearchParams(location.search);
const id = params.get('id') || '';
const statusEl = document.getElementById('status');
const progressEl = document.getElementById('progress');
const barEl = progressEl.querySelector('div');
let manifest = null;
let lastAction = null;

function setStatus(text, isError) {
	statusEl.textContent = text || '';
	statusEl.className = 'status' + (isError ? ' err' : '');
}
/** Surfaces any failure as a visible error with a Retry path - never a frozen status. */
function showFailure(text) {
	setStatus(text, true);
	if (lastAction) document.getElementById('btn-retry').style.display = 'inline-block';
}
window.addEventListener('error', e => { if (e && e.message) showFailure('Something went wrong: ' + e.message); });
window.addEventListener('unhandledrejection', e => {
	showFailure('Something went wrong: ' + ((e.reason && e.reason.message) || 'unknown error'));
});
/** Lets the browser repaint (progress bar, status) during long CPU work. */
function yieldToUi() { return new Promise(r => setTimeout(r, 0)); }
/** Rejects if a stage runs longer than ms - a stall becomes an error, not a freeze. */
function withTimeout(promise, ms, label) {
	return Promise.race([promise, new Promise((_, reject) =>
		setTimeout(() => reject(new Error(label + ' timed out after ' + Math.round(ms / 1000) + 's - the device or network may be very slow')), ms))]);
}
class SkipTrack extends Error {}
let skipRequested = false;
/** Races a stage promise against the Skip / Cancel buttons. */
function raceInterrupt(promise) {
	return Promise.race([promise, new Promise((_, reject) => {
		const iv = setInterval(() => {
			if (skipRequested) { clearInterval(iv); reject(new SkipTrack('skipped')); }
			else if (mergeCancelled) { clearInterval(iv); reject(new Error('Conversion cancelled.')); }
		}, 250);
		promise.then(() => clearInterval(iv), () => clearInterval(iv));
	})]);
}
function setProgress(done, total, label) {
	progressEl.style.display = 'block';
	barEl.style.width = total ? Math.round(done / total * 100) + '%' : '0%';
	if (label) setStatus(label);
}
function fmtBytes(n) {
	if (!n) return '0 MB';
	return n >= 1e9 ? (n / 1e9).toFixed(2) + ' GB' : (n / 1e6).toFixed(1) + ' MB';
}
function save(blob, name) {
	const a = document.createElement('a');
	a.href = URL.createObjectURL(blob);
	a.download = name;
	document.body.appendChild(a);
	a.click();
	a.remove();
	setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}
const FETCH_IDLE_MS = 60000;
async function fetchBlob(file, i, total, verb) {
	const urls = [file.directUrl, file.downloadUrl].filter(Boolean);
	let lastError = null;
	for (const url of urls) {
		try { return await fetchBlobFrom(url, file, i, total, verb); }
		catch (e) { lastError = e; }
	}
	throw new Error('Could not fetch ' + file.name + ' (' + (lastError && lastError.message) + ')');
}
/**
 * Fetches one file with live byte progress and an inactivity watchdog:
 * if no data arrives for FETCH_IDLE_MS the attempt aborts and the next
 * URL is tried, so a stalled download surfaces as an error instead of
 * sitting silent forever.
 */
async function fetchBlobFrom(url, file, i, total, verb) {
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
			const { done, value } = await reader.read();
			if (done) break;
			clearTimeout(idle); idle = setTimeout(() => ctrl.abort(), FETCH_IDLE_MS);
			parts.push(value); received += value.length;
			const frac = file.size ? Math.min(1, received / file.size) : 0;
			setProgress(i + frac, total, verb + ' ' + (i + 1) + ' of ' + total + ': ' + file.name + ' - ' + fmtBytes(received) + (file.size ? ' of ' + fmtBytes(file.size) : ''));
			await yieldToUi();
		}
		return new Blob(parts);
	} catch (e) {
		if (e && e.name === 'AbortError') throw new Error('download stalled (no data for ' + Math.round(FETCH_IDLE_MS / 1000) + 's)');
		throw e;
	} finally { clearTimeout(idle); }
}
/** Sniffs a file's real format from its first chunk only - no full download. */
async function sniffFile(file) {
	const urls = [file.directUrl, file.downloadUrl].filter(Boolean);
	for (const url of urls) {
		try {
			const res = await fetch(url);
			if (!res.ok) continue;
			if (res.body && res.body.getReader) {
				const reader = res.body.getReader();
				const { value } = await reader.read();
				try { await reader.cancel(); } catch (e) {}
				if (value && value.length) return sniffIsMp3(value.subarray(0, 4));
			}
			return await blobIsMp3(await res.blob());
		} catch (e) { /* try the next URL */ }
	}
	return false;
}

async function load() {
	if (!id) { setStatus('Missing bundle id.', true); return; }
	try {
		const res = await fetch(BASE + '/bundle/data?id=' + encodeURIComponent(id));
		const data = await res.json();
		if (!data.ok) throw new Error((data.error && data.error.message) || 'Bundle failed to load');
		manifest = data.bundle;
		document.getElementById('title').textContent = manifest.title;
		document.getElementById('subtitle').textContent =
			manifest.truncated ? 'Showing the first ' + manifest.eventCount + ' of ' + manifest.totalEvents + ' matching events (bundle cap).' : 'All matching sichos in this bundle.';
		document.getElementById('totals').innerHTML =
			'<span><b>' + manifest.eventCount + '</b> events</span>' +
			'<span><b>' + manifest.trackCount + '</b> audio files</span>' +
			'<span><b>' + fmtBytes(manifest.totalBytes) + '</b> total</span>';
		document.getElementById('rows').innerHTML = manifest.events.map((e, i) =>
			'<tr><td>' + (i + 1) + '</td><td>' + escapeHtml(e.title || '') + '</td><td>' + escapeHtml(e.dateLabel || '') + '</td><td>' + e.trackCount + '</td><td>' + fmtBytes(e.totalBytes) + '</td></tr>'
		).join('');
		document.getElementById('btn-zip').disabled = !manifest.files.length;
		document.getElementById('btn-merge').disabled = !manifest.files.length;
		if (params.get('action') === 'merge') downloadMerge();
		else if (params.get('action') === 'zip') downloadZip();
	} catch (e) {
		document.getElementById('title').textContent = 'Bundle unavailable';
		setStatus(e.message, true);
	}
}
function escapeHtml(s) {
	return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

async function downloadZip() {
	const btn = document.getElementById('btn-zip');
	btn.disabled = true;
	lastAction = downloadZip;
	try {
		const { makeZip } = await import('/apps/rebbe/modules/zip-store.js');
		const files = [];
		for (let i = 0; i < manifest.files.length; i++) {
			const file = manifest.files[i];
			files.push({ name: file.entryName, blob: await fetchBlob(file, i, manifest.files.length, 'Fetching for ZIP') });
		}
		setProgress(1, 1, 'Building ZIP…');
		save(await makeZip(files), 'rebbe-sichos-bundle.zip');
		setStatus('ZIP ready — ' + files.length + ' files.');
	} catch (e) { showFailure(e.message); }
	btn.disabled = false;
}
document.getElementById('btn-zip').addEventListener('click', downloadZip);

async function downloadMerge() {
	const btn = document.getElementById('btn-merge');
	btn.disabled = true;
	lastAction = downloadMerge;
	mergeCancelled = false;
	skipRequested = false;
	try {
		// Sniff each file's real first bytes cheaply (first chunk only):
		// the lossless join is used only when EVERY file is truly MP3.
		// Archive metadata lies - some .mp3 files are actually Ogg/Opus
		// (proven on the 5712 bundle, whose BH_009 starts with OggS
		// despite its MP3 label).
		let allMp3 = manifest.files.every(f => f.format === 'mp3');
		if (allMp3) {
			for (let i = 0; i < manifest.files.length; i++) {
				setProgress(i, manifest.files.length, 'Checking file formats ' + (i + 1) + ' of ' + manifest.files.length + ': ' + manifest.files[i].name);
				if (!(await sniffFile(manifest.files[i]))) { allMp3 = false; break; }
			}
		}
		if (allMp3) {
			const blobs = [];
			for (let i = 0; i < manifest.files.length; i++) {
				blobs.push(await fetchBlob(manifest.files[i], i, manifest.files.length, 'Fetching for merge'));
			}
			let joined = null;
			try {
				const { joinMp3Blobs } = await import('/apps/rebbe/modules/download/farbrengen/mp3-join.js');
				setProgress(1, 1, 'Joining MP3 frames (lossless, no re-encoding)...');
				joined = await withTimeout(joinMp3Blobs(blobs), 120000, 'Lossless join');
			} catch (joinError) {
				setStatus('Lossless join not possible for these files (' + joinError.message + ') - converting in your browser instead (one merged Opus file via the native media encoder)...');
				joined = null;
			}
			if (joined) {
				save(joined, 'rebbe-sichos-merged.mp3');
				setStatus('Merged MP3 ready - ' + blobs.length + ' files joined losslessly.');
			} else {
				await convertMergedAudio(async i => blobs[i]);
			}
		} else {
			setStatus('Not every file here is a true MP3, so this bundle will be converted in your browser into one merged Opus file (.opus) with the native media encoder...');
			await yieldToUi();
			// Stream the conversion: fetch each track only when its turn
			// comes, so a many-hour bundle never sits fully in memory.
			await convertMergedAudio(async i => await fetchBlob(manifest.files[i], i, manifest.files.length, 'Fetching for conversion'));
		}
	} catch (e) { showFailure('Browser merge failed: ' + e.message + ' - the ZIP always keeps every original file unchanged.'); }
	btn.disabled = false;
}
document.getElementById('btn-merge').addEventListener('click', downloadMerge);

let mergeCancelled = false;
document.getElementById('btn-cancel').addEventListener('click', () => { mergeCancelled = true; });

/** Sniffs MP3 magic: an ID3 tag, or an MPEG frame sync with a real layer. */
function sniffIsMp3(bytes) {
	if (bytes.length >= 3 && bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) return true;
	if (bytes.length >= 2 && bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0) return ((bytes[1] >> 1) & 0x03) !== 0;
	return false;
}
async function blobIsMp3(blob) {
	const head = new Uint8Array(await blob.slice(0, 4).arrayBuffer());
	return sniffIsMp3(head);
}

let encoderPromise = null;
/** Loads the vendored lamejs MP3 encoder (LGPL-3.0) - lazily, only when a conversion is actually needed. */
function loadMp3Encoder() {
	if (window.lamejs && window.lamejs.Mp3Encoder) return Promise.resolve(window.lamejs);
	if (!encoderPromise) {
		encoderPromise = new Promise((resolve, reject) => {
			const s = document.createElement('script');
			s.src = '/apps/rebbe/modules/download/lame.min.js';
			s.onload = () => (window.lamejs && window.lamejs.Mp3Encoder)
				? resolve(window.lamejs)
				: reject(new Error('MP3 encoder failed to initialize'));
			s.onerror = () => reject(new Error('Could not load the MP3 encoder'));
			document.head.appendChild(s);
		});
	}
	return encoderPromise;
}

/**
 * Signals that the WebCodecs path cannot handle this bundle (unknown
 * container, missing decoder) and the whole conversion should restart
 * through the lamejs fallback instead. Thrown only before any track of
 * the WebCodecs attempt has been committed, or the dispatcher treats it
 * as a fresh restart - encoded chunks are per-attempt locals, so a
 * restart never mixes output from two engines.
 */
class FallbackEngine extends Error {}

/**
 * Feature-detects the browser's native media-encoder path (WebCodecs).
 * Conversion encodes with the Opus encoder: as probed exhaustively on
 * Chrome 157, AudioEncoder offers NO MP3 encoding in any combination -
 * Opus is the only encode codec - and Hai's ruling (2026-11-26) accepts
 * a merged Opus file for converted bundles. Opus encoding runs at
 * 48000 Hz (the only rate the WebCodecs Opus registration accepts for
 * encoding besides sub-telephone rates); decoded tracks are resampled
 * to 48000 in-page while streaming. Never assume - always ask.
 */
let webCodecsProbePromise = null;
function probeWebCodecs() {
	if (!webCodecsProbePromise) {
		webCodecsProbePromise = (async () => {
			const support = { available: false, opusEncode: false, decoders: {}, reason: '' };
			try {
				if (!window.isSecureContext) { support.reason = 'page is not a secure context'; return support; }
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
		})();
	}
	return webCodecsProbePromise;
}

/** Parses one MPEG audio frame header; returns frame geometry or null. */
function parseMp3Header(b, off) {
	if (off + 4 > b.length) return null;
	if (b[off] !== 0xff || (b[off + 1] & 0xe0) !== 0xe0) return null;
	const verBits = (b[off + 1] >> 3) & 3;
	if (verBits === 1) return null;
	const layerBits = (b[off + 1] >> 1) & 3;
	if (layerBits === 0) return null;
	const layer = 4 - layerBits;
	const brIdx = (b[off + 2] >> 4) & 15;
	if (brIdx === 0 || brIdx === 15) return null;
	const srIdx = (b[off + 2] >> 2) & 3;
	if (srIdx === 3) return null;
	const pad = (b[off + 2] >> 1) & 1;
	const chanMode = (b[off + 3] >> 6) & 3;
	const sampleRate = (verBits === 3 ? [44100, 48000, 32000] : verBits === 2 ? [22050, 24000, 16000] : [11025, 12000, 8000])[srIdx];
	let kbps;
	if (verBits === 3) kbps = [null,
		[32, 64, 96, 128, 160, 192, 224, 256, 288, 320, 352, 384, 416, 448],
		[32, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 384],
		[32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320]][layer][brIdx - 1];
	else kbps = (layer === 1
		? [32, 48, 56, 64, 80, 96, 112, 128, 144, 160, 176, 192, 224, 256]
		: [8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160])[brIdx - 1];
	const br = kbps * 1000;
	const samples = layer === 1 ? 384 : layer === 2 ? 1152 : (verBits === 3 ? 1152 : 576);
	let len;
	if (layer === 1) len = Math.floor(12 * br / sampleRate + pad) * 4;
	else if (layer === 2) len = Math.floor(144 * br / sampleRate) + pad;
	else len = Math.floor((verBits === 3 ? 144 : 72) * br / sampleRate) + pad;
	if (len < 4) return null;
	return { len, sampleRate, samples, channels: chanMode === 3 ? 1 : 2, durationUs: Math.round(samples / sampleRate * 1e6) };
}

/**
 * Splits raw MP3 bytes into frames for AudioDecoder: skips an ID3v2 tag,
 * then walks frame headers. Timestamps are cumulative frame durations -
 * the elementary stream WebCodecs expects (it does not demux files).
 */
function splitMp3Frames(bytes) {
	let off = 0;
	if (bytes.length >= 10 && bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) {
		const size = ((bytes[6] & 0x7f) << 21) | ((bytes[7] & 0x7f) << 14) | ((bytes[8] & 0x7f) << 7) | (bytes[9] & 0x7f);
		off = 10 + size + ((bytes[5] & 0x10) ? 10 : 0);
	}
	const frames = [];
	let ts = 0, sampleRate = 0, channels = 2;
	while (off + 4 <= bytes.length) {
		const h = parseMp3Header(bytes, off);
		if (!h || off + h.len > bytes.length) break;
		if (!sampleRate) { sampleRate = h.sampleRate; channels = h.channels; }
		frames.push({ data: bytes.subarray(off, off + h.len), timestamp: ts, duration: h.durationUs });
		ts += h.durationUs;
		off += h.len;
	}
	return { packets: frames, sampleRate, channels, durationUs: ts };
}

/** Duration of one Opus frame for a TOC byte (RFC 6716, Table 2). */
function opusFrameDurationUs(toc) {
	const config = (toc >> 3) & 31;
	if (config < 12) return [10000, 20000, 40000, 60000][config & 3];
	if (config < 16) return (config & 1) ? 20000 : 10000;
	return [2500, 5000, 10000, 20000][config & 3];
}
function opusPacketDurationUs(p) {
	if (!p.length) return 0;
	const code = p[0] & 3;
	let frames = 1;
	if (code === 1 || code === 2) frames = 2;
	else if (code === 3) frames = p.length > 1 ? (p[1] & 0x3f) : 1;
	if (!frames) frames = 1;
	return Math.min(120000, opusFrameDurationUs(p[0]) * frames);
}

/**
 * Minimal Ogg demuxer for the archive's Opus-in-Ogg files (the ones
 * misnamed .mp3): walks Ogg pages of the first logical stream, stitches
 * packets across page boundaries, and returns the OpusHead (the decoder
 * description) plus audio packets with TOC-derived timestamps.
 */
function demuxOggOpus(bytes) {
	const packets = [];
	let parts = [];
	let serial = null;
	let off = 0;
	const flushPacket = () => {
		if (!parts.length) return;
		let totalLen = 0;
		for (const part of parts) totalLen += part.length;
		const pkt = new Uint8Array(totalLen);
		let o = 0;
		for (const part of parts) { pkt.set(part, o); o += part.length; }
		packets.push(pkt);
		parts = [];
	};
	while (off + 27 <= bytes.length) {
		if (!(bytes[off] === 0x4f && bytes[off + 1] === 0x67 && bytes[off + 2] === 0x67 && bytes[off + 3] === 0x53)) { off++; continue; }
		const segCount = bytes[off + 26];
		if (off + 27 + segCount > bytes.length) break;
		const pageSerial = (bytes[off + 14] | (bytes[off + 15] << 8) | (bytes[off + 16] << 16) | (bytes[off + 17] << 24)) >>> 0;
		if (serial === null) serial = pageSerial;
		let p = off + 27 + segCount;
		for (let s = 0; s < segCount; s++) {
			const segLen = bytes[off + 27 + s];
			if (pageSerial === serial) {
				parts.push(bytes.subarray(p, Math.min(p + segLen, bytes.length)));
				if (segLen < 255) flushPacket();
			}
			p += segLen;
		}
		off = p;
	}
	flushPacket();
	const isOpusHead = pkt => pkt && pkt.length >= 19 &&
		pkt[0] === 0x4f && pkt[1] === 0x70 && pkt[2] === 0x75 && pkt[3] === 0x73 &&
		pkt[4] === 0x48 && pkt[5] === 0x65 && pkt[6] === 0x61 && pkt[7] === 0x64;
	if (!isOpusHead(packets[0])) return { head: null, channels: 2, packets: [], durationUs: 0 };
	const head = packets[0];
	const audio = [];
	let ts = 0;
	for (let i = 1; i < packets.length; i++) {
		const pkt = packets[i];
		if (pkt.length >= 8 && pkt[0] === 0x4f && pkt[1] === 0x70 && pkt[2] === 0x75 && pkt[3] === 0x73 &&
			pkt[4] === 0x54 && pkt[5] === 0x61 && pkt[6] === 0x67 && pkt[7] === 0x73) continue; // OpusTags
		const d = opusPacketDurationUs(pkt);
		audio.push({ data: pkt, timestamp: ts, duration: d });
		ts += d;
	}
	return { head, channels: head[9] || 2, packets: audio, durationUs: ts };
}

/* ================= Ogg/Opus muxer (client-side) ================= */

const OGG_CRC_TABLE = (() => {
	const table = new Uint32Array(256);
	for (let n = 0; n < 256; n++) {
		let r = n << 24;
		for (let k = 0; k < 8; k++) r = (r & 0x80000000) ? ((r << 1) ^ 0x04c11db7) : (r << 1);
		table[n] = r >>> 0;
	}
	return table;
})();
function oggCrc(bytes) {
	let crc = 0;
	for (let i = 0; i < bytes.length; i++) crc = ((crc << 8) ^ OGG_CRC_TABLE[((crc >>> 24) ^ bytes[i]) & 0xff]) >>> 0;
	return crc;
}

/**
 * Minimal Ogg muxer for Opus: writes a standard .opus stream - OpusHead
 * alone on the BOS page, OpusTags next, then audio pages with correct
 * segment tables, page sequence numbers, 48 kHz granule positions and
 * CRC32 checksums. Packets are grouped (~16 KB per page) and the final
 * page carries EOS. Pure byte work - no server, no library.
 */
function createOggOpusMuxer(channels) {
	const serial = (Math.random() * 0xffffffff) >>> 0;
	const parts = [];
	let seq = 0;
	let totalSamples = 0;
	let pending = [];
	let pendingBytes = 0;
	let pendingSamples = 0;
	function writePage(packets, flags, granule) {
		const segs = [];
		let bodyLen = 0;
		for (const pkt of packets) {
			bodyLen += pkt.length;
			let n = pkt.length;
			while (n >= 255) { segs.push(255); n -= 255; }
			segs.push(n);
		}
		const page = new Uint8Array(27 + segs.length + bodyLen);
		page.set([0x4f, 0x67, 0x67, 0x53, 0, flags], 0); // 'OggS', version 0
		const view = new DataView(page.buffer);
		view.setUint32(6, granule >>> 0, true);
		view.setUint32(10, Math.floor(granule / 0x100000000), true);
		view.setUint32(14, serial, true);
		view.setUint32(18, seq++, true);
		page[26] = segs.length;
		page.set(segs, 27);
		let o = 27 + segs.length;
		for (const pkt of packets) { page.set(pkt, o); o += pkt.length; }
		view.setUint32(22, oggCrc(page), true);
		parts.push(page);
	}
	const head = new Uint8Array(19);
	head.set([0x4f, 0x70, 0x75, 0x73, 0x48, 0x65, 0x61, 0x64], 0); // 'OpusHead'
	head[8] = 1; // version
	head[9] = channels;
	new DataView(head.buffer).setUint16(10, 0, true); // pre-skip
	new DataView(head.buffer).setUint32(12, 48000, true); // input sample rate (informational)
	head[16] = 0; head[17] = 0; // output gain
	head[18] = 0; // channel mapping family 0
	writePage([head], 0x02, 0); // BOS
	const vendor = 'Awtsmoos Rebbe Archive';
	const tags = new Uint8Array(8 + 4 + vendor.length + 4);
	tags.set([0x4f, 0x70, 0x75, 0x73, 0x54, 0x61, 0x67, 0x73], 0); // 'OpusTags'
	new DataView(tags.buffer).setUint32(8, vendor.length, true);
	tags.set(new TextEncoder().encode(vendor), 12);
	writePage([tags], 0x00, 0);
	return {
		writePacket(data, durationUs) {
			const samples = Math.max(0, Math.round((durationUs || 0) * 48000 / 1e6));
			pending.push(data);
			pendingBytes += data.length;
			pendingSamples += samples;
			if (pendingBytes >= 16384 || pending.length >= 40) {
				totalSamples += pendingSamples;
				writePage(pending, 0x00, totalSamples);
				pending = []; pendingBytes = 0; pendingSamples = 0;
			}
		},
		finish() {
			totalSamples += pendingSamples;
			writePage(pending, 0x01, totalSamples); // EOS
			pending = []; pendingBytes = 0; pendingSamples = 0;
			return parts;
		},
		get bytesWritten() { return parts.reduce((n, p) => n + p.length, 0); }
	};
}

/** Decodes one plane/sample buffer of an AudioData into Float32 samples. */
function webCodecsSamplesToFloat(buf, type, count) {
	const out = new Float32Array(count);
	if (type === 'f32') { out.set(new Float32Array(buf, 0, count)); return out; }
	if (type === 's16') { const v = new Int16Array(buf, 0, count); for (let i = 0; i < count; i++) out[i] = v[i] / 32768; return out; }
	if (type === 's32') { const v = new Int32Array(buf, 0, count); for (let i = 0; i < count; i++) out[i] = v[i] / 2147483648; return out; }
	if (type === 'u8') { const v = new Uint8Array(buf, 0, count); for (let i = 0; i < count; i++) out[i] = (v[i] - 128) / 128; return out; }
	return out;
}

/** Extracts an AudioData's samples as per-channel Float32Arrays, whatever its format. */
function audioDataToPlanar(ad) {
	const fmt = ad.format || 'f32-planar';
	const type = fmt.split('-')[0];
	const frames = ad.numberOfFrames;
	const nch = ad.numberOfChannels;
	const channels = [];
	if (fmt.indexOf('planar') !== -1) {
		for (let c = 0; c < nch; c++) {
			const buf = new ArrayBuffer(ad.allocationSize({ planeIndex: c }));
			ad.copyTo(buf, { planeIndex: c });
			channels.push(webCodecsSamplesToFloat(buf, type, frames));
		}
	} else {
		const buf = new ArrayBuffer(ad.allocationSize({ planeIndex: 0 }));
		ad.copyTo(buf, { planeIndex: 0 });
		const all = webCodecsSamplesToFloat(buf, type, frames * nch);
		for (let c = 0; c < nch; c++) {
			const ch = new Float32Array(frames);
			for (let i = 0; i < frames; i++) ch[i] = all[i * nch + c];
			channels.push(ch);
		}
	}
	return channels;
}

/**
 * Streaming linear-interpolation resampler to 48000 Hz with channel
 * mapping (mono<->stereo). Holds only a couple of unconsumed input
 * samples between chunks, so it streams tracks of any length. Speech
 * makes linear interpolation entirely adequate, and it keeps the whole
 * pipeline native-speed. Emits blocks of up to 4800 output frames.
 */
function createResampler48000(inRate, inChannels, outChannels) {
	const step = inRate / 48000;
	let pend = null; // per-input-channel Float32Array leftovers
	let frac = 0;
	let block = null; // per-out-channel Float32Array(4800)
	let blockLen = 0;
	function newBlock() { return Array.from({ length: outChannels }, () => new Float32Array(4800)); }
	/** Interpolated sample for output channel oc at input position i0+f. */
	function sampleAt(merged, oc, i0, f) {
		const at = c => merged[c][i0] * (1 - f) + merged[c][i0 + 1] * f;
		if (inChannels === 1) return at(0);
		if (outChannels === 1) return (at(0) + at(1)) / 2;
		return at(Math.min(oc, inChannels - 1));
	}
	function emit(out, oc, v) {
		block[oc][blockLen] = v;
	}
	function push(planar, frames, out) {
		const merged = [];
		for (let c = 0; c < inChannels; c++) {
			const prev = pend ? pend[c] : null;
			const m = new Float32Array((prev ? prev.length : 0) + frames);
			if (prev) m.set(prev, 0);
			m.set(planar[c], prev ? prev.length : 0);
			merged.push(m);
		}
		const len = merged[0].length;
		if (!block) block = newBlock();
		while (Math.floor(frac) + 1 < len) {
			const i0 = Math.floor(frac);
			const f = frac - i0;
			for (let oc = 0; oc < outChannels; oc++) emit(out, oc, sampleAt(merged, oc, i0, f));
			blockLen++;
			frac += step;
			if (blockLen === 4800) { out.push({ channels: block, frames: 4800 }); block = newBlock(); blockLen = 0; }
		}
		const drop = Math.min(Math.floor(frac), len);
		pend = merged.map(ch => ch.subarray(drop));
		frac -= drop;
	}
	function flush(out) {
		if (pend && pend[0].length) {
			// Extend the tail virtually with the last sample so the final
			// fractional outputs are produced, then stop.
			const ext = pend.map(ch => {
				const m = new Float32Array(ch.length + 1);
				m.set(ch, 0);
				m[ch.length] = ch[ch.length - 1];
				return m;
			});
			const len = ext[0].length;
			if (!block) block = newBlock();
			while (Math.floor(frac) + 1 < len) {
				const i0 = Math.floor(frac);
				const f = frac - i0;
				for (let oc = 0; oc < outChannels; oc++) emit(out, oc, sampleAt(ext, oc, i0, f));
				blockLen++;
				frac += step;
				if (blockLen === 4800) { out.push({ channels: block, frames: 4800 }); block = newBlock(); blockLen = 0; }
			}
		}
		if (block && blockLen) out.push({ channels: block.map(ch => ch.subarray(0, blockLen)), frames: blockLen });
		block = null; blockLen = 0; pend = null; frac = 0;
	}
	return { push, flush };
}

/** Packs one resampled block into an f32-planar AudioData at a timeline timestamp. */
function blockToAudioData(block, timestampUs) {
	const frames = block.frames;
	const nch = block.channels.length;
	const buf = new ArrayBuffer(frames * 4 * nch);
	const view = new Uint8Array(buf);
	for (let c = 0; c < nch; c++) view.set(new Uint8Array(block.channels[c].buffer, block.channels[c].byteOffset, frames * 4), c * frames * 4);
	return new AudioData({ format: 'f32-planar', sampleRate: 48000, numberOfFrames: frames, numberOfChannels: nch, timestamp: timestampUs, data: buf });
}

/**
 * WebCodecs conversion path - the primary converter (used when this
 * browser's AudioEncoder offers Opus, which is the only encode codec
 * Chrome ships): per track, demux the container in-page, stream packets
 * through AudioDecoder, resample the decoded PCM to 48 kHz as it flows,
 * and feed it straight into ONE shared AudioEncoder; its Opus chunks are
 * muxed into a standard Ogg .opus file in-page. No whole-track PCM is
 * ever held, and the encode itself runs at native speed - many times
 * faster than any JS encoder. Same discipline as everywhere on this
 * page: per-stage progress, watchdogs, Skip / Cancel, visible errors.
 */
async function convertWithWebCodecsOpus(getBlob, support) {
	const cancelBtn = document.getElementById('btn-cancel');
	const skipBtn = document.getElementById('btn-skip');
	cancelBtn.style.display = 'inline-block';
	skipBtn.style.display = 'inline-block';
	const total = manifest.files.length;
	let encoder = null;
	let muxer = null;
	let encChannels = 0;
	let encError = null;
	let feedError = null;
	let feedChain = Promise.resolve();
	let outFrames = 0;
	let encodedBytes = 0;
	let totalSeconds = 0;
	let skipped = 0;
	const checkInterrupt = () => {
		if (mergeCancelled) throw new Error('Conversion cancelled.');
		if (skipRequested) throw new SkipTrack('skipped');
	};
	const closeEncoder = async flushIt => {
		if (!encoder) return;
		const enc = encoder;
		encoder = null;
		if (flushIt) { try { await enc.flush(); } catch (e) {} }
		try { enc.close(); } catch (e) {}
	};
	const ensurePipeline = channels => {
		if (encoder) return;
		encChannels = channels;
		muxer = createOggOpusMuxer(channels);
		encError = null;
		encoder = new AudioEncoder({
			output: chunk => {
				const buf = new ArrayBuffer(chunk.byteLength);
				chunk.copyTo(buf);
				muxer.writePacket(new Uint8Array(buf), chunk.duration || 0);
				encodedBytes = muxer.bytesWritten;
			},
			error: e => { encError = e; }
		});
		encoder.configure({ codec: 'opus', sampleRate: 48000, numberOfChannels: channels, bitrate: channels === 2 ? 128000 : 96000 });
	};
	const feedBlock = async block => {
		while (encoder && encoder.encodeQueueSize > 8) { checkInterrupt(); await new Promise(r => setTimeout(r, 5)); }
		if (encError) throw encError;
		const ad = blockToAudioData(block, Math.round(outFrames * 1e6 / 48000));
		outFrames += block.frames;
		encoder.encode(ad);
	};
	try {
		for (let i = 0; i < total; i++) {
			if (mergeCancelled) throw new Error('Conversion cancelled.');
			skipRequested = false;
			const file = manifest.files[i];
			let decoder = null;
			try {
				const blob = await raceInterrupt(Promise.resolve(getBlob(i)));
				setProgress(i, total, 'Converting ' + (i + 1) + ' of ' + total + ': ' + file.name + ' - decoding (native media encoder)...');
				const bytes = new Uint8Array(await blob.arrayBuffer());
				let demuxed, decConfig, codec;
				if (bytes.length >= 4 && bytes[0] === 0x4f && bytes[1] === 0x67 && bytes[2] === 0x67 && bytes[3] === 0x53) {
					const d = demuxOggOpus(bytes);
					if (!d.head || !d.packets.length) throw new FallbackEngine('could not demux the Ogg/Opus file ' + file.name);
					demuxed = d;
					codec = 'opus';
					decConfig = { codec: 'opus', sampleRate: 48000, numberOfChannels: d.channels, description: d.head };
				} else if (sniffIsMp3(bytes.subarray(0, 4))) {
					const d = splitMp3Frames(bytes);
					if (!d.packets.length) throw new FallbackEngine('could not split the MP3 file ' + file.name + ' into frames');
					demuxed = d;
					codec = 'mp3';
					decConfig = { codec: 'mp3', sampleRate: d.sampleRate, numberOfChannels: d.channels };
				} else {
					throw new FallbackEngine('format of ' + file.name + ' needs the fallback converter');
				}
				if (support.decoders[codec] === false) throw new FallbackEngine('no WebCodecs decoder for ' + codec + ' in this browser');
				const expectedUs = file.duration ? file.duration * 1e6 : demuxed.durationUs;
				let decodedUs = 0;
				let decError = null;
				let resampler = null;
				decoder = new AudioDecoder({
					output: ad => {
						decodedUs = Math.max(decodedUs, ad.timestamp + (ad.duration || 0));
						const frac = expectedUs ? Math.min(1, decodedUs / expectedUs) : 0;
						setProgress(i + frac, total, 'Converting ' + (i + 1) + ' of ' + total + ': ' + file.name + ' - ' + Math.round(frac * 100) + '% - Opus so far ' + fmtBytes(encodedBytes) + ' (native media encoder)');
						feedChain = feedChain.then(async () => {
							if (feedError) { try { ad.close(); } catch (e) {} return; }
							try {
								checkInterrupt();
								ensurePipeline(Math.min(2, Math.max(1, ad.numberOfChannels)));
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
						while (decoder.decodeQueueSize > 16) { checkInterrupt(); await new Promise(r => setTimeout(r, 5)); }
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
				totalSeconds += decodedUs / 1e6;
				if (decodedUs === 0) throw new Error('Decoding ' + file.name + ' produced no audio');
			} catch (trackError) {
				if (trackError instanceof SkipTrack) {
					skipped++;
					feedError = null;
					feedChain = Promise.resolve();
					setStatus('Skipped ' + file.name + ' - continuing with the next track...');
					await yieldToUi();
					continue;
				}
				throw trackError;
			} finally {
				if (decoder) { try { decoder.close(); } catch (e) {} }
			}
		}
		if (mergeCancelled) throw new Error('Conversion cancelled.');
		if (!encoder && !skipped) throw new Error('Nothing was converted.');
		if (!encoder) throw new Error('Every track was skipped - nothing to save.');
		setProgress(1, 1, 'Finishing Opus file...');
		await closeEncoder(true);
		if (encError) throw encError;
		save(new Blob(muxer.finish(), { type: 'audio/ogg' }), 'rebbe-sichos-merged.opus');
		setStatus('Merged Opus ready - ' + (total - skipped) + ' of ' + total + ' files converted and combined (' + Math.round(totalSeconds) + ' seconds' + (skipped ? ', ' + skipped + ' skipped' : '') + ', native media encoder, converted in your browser).');
	} finally {
		await closeEncoder(false);
		cancelBtn.style.display = 'none';
		skipBtn.style.display = 'none';
	}
}

/**
 * Conversion dispatcher: the native WebCodecs Opus path first (near-
 * instant, fully in the browser), the async lamejs MP3 path only when
 * the browser has no WebCodecs Opus encoder or the native path declines
 * this bundle's formats - the user always sees which file they are
 * getting (Opus vs MP3) in the status line and the saved filename. The
 * chosen engine is published on window.__rebbeConvert so the page's
 * behavior is observable (support probes, browser tests, support).
 */
async function convertMergedAudio(getBlob) {
	const support = await probeWebCodecs();
	window.__rebbeConvert = {
		engine: support.opusEncode ? 'webcodecs-opus' : 'lamejs',
		reason: support.reason || '',
		webCodecs: support,
		startedAt: new Date().toISOString()
	};
	if (support.opusEncode) {
		try {
			await convertWithWebCodecsOpus(getBlob, support);
			window.__rebbeConvert.done = true;
			return;
		} catch (e) {
			if (e instanceof FallbackEngine) {
				window.__rebbeConvert.engine = 'lamejs';
				window.__rebbeConvert.reason = 'media-encoder path declined: ' + e.message;
				setStatus('The native media encoder cannot take this bundle (' + e.message + ') - switching to the built-in MP3 converter...');
				await yieldToUi();
			} else throw e;
		}
	}
	await convertWithLamejs(getBlob);
	window.__rebbeConvert.done = true;
}

// Test/observability surface: the demuxers, the Ogg/Opus muxer and the
// support probe, so a browser harness can prove the WebCodecs path on
// real files and validate muxed output by demuxing it back.
window.__rebbeWebCodecs = { probe: probeWebCodecs, splitMp3Frames, demuxOggOpus, parseMp3Header, createOggOpusMuxer, opusPacketDurationUs };

/**
 * Fallback mixed-format path (browsers whose media encoder has no MP3):
 * decode ONE track at a time with Web Audio and encode it to MP3
 * incrementally with lamejs (128 kbps stereo / 96 kbps mono -
 * speech-appropriate). Memory stays bounded: at most one decoded
 * AudioBuffer plus the encoded MP3 chunks are ever alive; each compressed
 * blob and each decoded buffer is released before the next track starts.
 * (The old uncompressed path decoded EVERYTHING into one giant PCM
 * buffer and crashed the page on long bundles - Hai's ruling,
 * 2026-11-26: convert to MP3 in the browser instead.)
 */
async function convertWithLamejs(getBlob) {
	const lamejs = await withTimeout(loadMp3Encoder(), 30000, 'MP3 encoder load');
	const cancelBtn = document.getElementById('btn-cancel');
	const skipBtn = document.getElementById('btn-skip');
	cancelBtn.style.display = 'inline-block';
	skipBtn.style.display = 'inline-block';
	const decodeCtx = new OfflineAudioContext(1, 1, 44100);
	const chunks = [];
	let encoder = null;
	let channels = 2;
	let totalSeconds = 0;
	let encodedBytes = 0;
	let skipped = 0;
	const total = manifest.files.length;
	try {
		for (let i = 0; i < total; i++) {
			if (mergeCancelled) throw new Error('Conversion cancelled.');
			skipRequested = false;
			const file = manifest.files[i];
			try {
				const blob = await raceInterrupt(Promise.resolve(getBlob(i)));
				setProgress(i, total, 'Converting ' + (i + 1) + ' of ' + total + ': ' + file.name + ' - decoding...');
				let buffer = await raceInterrupt(withTimeout(
					decodeCtx.decodeAudioData(await blob.arrayBuffer()), 180000, 'Decoding ' + file.name));
				if (!encoder) {
					channels = Math.min(2, Math.max(1, buffer.numberOfChannels));
					encoder = new lamejs.Mp3Encoder(channels, buffer.sampleRate, channels === 2 ? 128 : 96);
				}
				const before = encodedBytes;
				encodedBytes += await encodeTrack(encoder, buffer, channels, chunks, (frac, trackBytes) => {
					setProgress(i + frac, total, 'Converting ' + (i + 1) + ' of ' + total + ': ' + file.name + ' - ' + Math.round(frac * 100) + '% - MP3 so far ' + fmtBytes(before + trackBytes));
				});
				totalSeconds += buffer.duration;
				buffer = null; // release the decoded PCM before the next track
			} catch (trackError) {
				if (trackError instanceof SkipTrack) {
					skipped++;
					setStatus('Skipped ' + file.name + ' - continuing with the next track...');
					await yieldToUi();
					continue;
				}
				throw trackError;
			}
		}
		if (mergeCancelled) throw new Error('Conversion cancelled.');
		if (!encoder) throw new Error('Every track was skipped - nothing to save.');
		setProgress(1, 1, 'Finishing MP3...');
		const tail = encoder.flush();
		if (tail.length) { chunks.push(new Blob([tail])); encodedBytes += tail.length; }
		save(new Blob(chunks, { type: 'audio/mpeg' }), 'rebbe-sichos-merged.mp3');
		setStatus('Merged MP3 ready - ' + (total - skipped) + ' of ' + total + ' files converted and combined (' + Math.round(totalSeconds) + ' seconds' + (skipped ? ', ' + skipped + ' skipped' : '') + ').');
	} finally {
		cancelBtn.style.display = 'none';
		skipBtn.style.display = 'none';
	}
}

/**
 * Encodes one decoded AudioBuffer into the shared encoder, in small
 * blocks. ASYNC on purpose: it yields to the browser every ~200ms and
 * reports progress per block-group. The previous synchronous version
 * blocked the main thread for the whole track (~2 minutes for a
 * 10-minute track on a busy CPU), so the status and progress bar froze
 * on "Converting 1 of N" and the page looked dead - Hai's bug report,
 * 2026-11-26, proven by CDP trace (decode 7s, then 114s of solid
 * main-thread encode with Runtime.evaluate timing out).
 */
async function encodeTrack(encoder, buffer, channels, chunks, onProgress) {
	const left = buffer.getChannelData(0);
	const right = buffer.numberOfChannels > 1 ? buffer.getChannelData(1) : left;
	const BLOCK = 1152 * 32;
	let bytes = 0;
	let lastYield = performance.now();
	let lastReport = 0;
	for (let off = 0; off < left.length; off += BLOCK) {
		if (mergeCancelled) throw new Error('Conversion cancelled.');
		if (skipRequested) throw new SkipTrack('skipped');
		const end = Math.min(off + BLOCK, left.length);
		const l16 = floatTo16(left, off, end);
		let data;
		if (channels === 2) data = encoder.encodeBuffer(l16, floatTo16(right, off, end));
		else data = encoder.encodeBuffer(l16);
		if (data.length) { chunks.push(new Blob([data])); bytes += data.length; }
		const frac = end / left.length;
		if (onProgress && (frac - lastReport >= 0.01 || frac === 1)) { lastReport = frac; onProgress(frac, bytes); }
		if (performance.now() - lastYield > 200) { await yieldToUi(); lastYield = performance.now(); }
	}
	return bytes;
}

/** Converts a slice of Float32 samples to Int16 PCM. */
function floatTo16(data, off, end) {
	const out = new Int16Array(end - off);
	for (let i = off; i < end; i++) {
		const s = Math.max(-1, Math.min(1, data[i]));
		out[i - off] = s < 0 ? s * 0x8000 : s * 0x7fff;
	}
	return out;
}

document.getElementById('btn-skip').addEventListener('click', () => { skipRequested = true; });
document.getElementById('btn-retry').addEventListener('click', () => {
	document.getElementById('btn-retry').style.display = 'none';
	if (lastAction) lastAction();
});

load();
</script>
</body>
</html>`;
}

/**
 * Renders the human API documentation page.
 * @param {string} base Public API base path.
 * @returns {string} HTML document.
 */
function docsPage(base) {
	return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Rebbe Sichos Search API — Awtsmoos</title>
<style>${STYLE}</style>
</head>
<body>
<div class="wrap">
	<p class="sub">B"H · Awtsmoos</p>
	<h1>Rebbe Sichos Search API</h1>
	<p class="sub">Machine-readable search over the same Archive.org sichos index the <a href="/apps/rebbe/">Rebbe app</a> browses — by Hebrew month, day and year, with ranges and keyword — plus bundle links an agent can hand straight to a user: one link zips or merges every matching sicha in the user's browser. No auth. JSON everywhere. Machine descriptor: <a href="${base}/">${base}/</a></p>

	<h2>Search</h2>
	<div class="card">
		<p><code>GET ${base}/search</code></p>
		<table>
			<tr><th>Param</th><th>Meaning</th></tr>
			<tr><td><code>month</code> / <code>months</code></td><td>Hebrew month id(s) 1–12 (1=Tishrei … 12=Elul), comma list ok</td></tr>
			<tr><td><code>monthFrom</code>, <code>monthTo</code></td><td>Month range</td></tr>
			<tr><td><code>day</code> / <code>days</code></td><td>Day(s) of month 1–30, comma list ok</td></tr>
			<tr><td><code>dayFrom</code>, <code>dayTo</code></td><td>Day range</td></tr>
			<tr><td><code>year</code> / <code>years</code></td><td>Hebrew year(s), e.g. <code>5749</code>, comma list ok</td></tr>
			<tr><td><code>yearFrom</code>, <code>yearTo</code></td><td>Year range</td></tr>
			<tr><td><code>q</code></td><td>Keyword over title/folder/date (e.g. <code>farbrengen</code>)</td></tr>
			<tr><td><code>limit</code>, <code>offset</code></td><td>Pagination; limit 1–200, default 50</td></tr>
			<tr><td><code>include=tracks</code></td><td>Also expand each event's audio files (URLs, sizes, durations)</td></tr>
		</table>
		<pre>curl "${base}/search?month=3&amp;day=19"
curl "${base}/search?monthFrom=3&amp;monthTo=4&amp;dayFrom=15&amp;dayTo=19&amp;q=farbrengen"</pre>
		<p>Response: <code>{ ok, total, count, limit, offset, hasMore, results: [{ id, title, year, month, monthId, day, dateLabel, folder, archiveItem, archiveUrl, eventUrl }] }</code>. Empty ranges return <code>total: 0, results: []</code> — never an error.</p>
	</div>

	<h2>One event's files</h2>
	<div class="card">
		<p><code>GET ${base}/event?bucket=&lt;archiveItem&gt;&amp;folder=&lt;folder&gt;</code> (or <code>year=</code> instead of <code>bucket=</code>)</p>
		<p>Returns the event plus <code>tracks: [{ title, fileName, format, size, duration, md5, downloadUrl, directUrl }]</code>.</p>
	</div>

	<h2>Bundles — links for end users</h2>
	<div class="card">
		<p><code>GET|POST ${base}/bundle</code> with the same search params (plus optional <code>title</code>) creates a bundle and returns:</p>
		<pre>{
  "bundleId": "…",
  "pageUrl":  "${base}/bundle/page?id=…",
  "zipUrl":   "${base}/bundle/page?id=\u2026&amp;action=zip",
  "mergeUrl": "${base}/bundle/page?id=…&amp;action=merge",
  "manifestUrl": "${base}/bundle/data?id=…",
  "eventCount": 12, "trackCount": 14, "totalBytes": 81234567
}</pre>
		<p>Give the user <b>pageUrl</b> \u2014 it is THE download link. The page lists the bundle and offers <b>Download ZIP</b> and <b>Download merged audio</b>, all assembled in the user's own browser from the original Archive.org files (ZIP via the app's own zip-store; merged audio = an MP3 lossless frame join when every file is true MP3; when a bundle contains other formats under an .mp3 name, e.g. Opus, the page converts instead - primarily with the browser's native media encoder (WebCodecs AudioEncoder, feature-detected) into one merged Opus file (.opus), which is near-instant because Chrome's media encoder has no MP3 encoder but does encode Opus natively; on browsers without WebCodecs it falls back to decoding one track at a time with Web Audio into a vendored lamejs MP3 encoder, so memory stays bounded even on many-hour bundles). <b>zipUrl</b> and <b>mergeUrl</b> are the same page focused on that action, and opening one starts that download in the browser. The server never downloads the audio: the legacy <code>${base}/bundle/zip</code> and <code>${base}/bundle/merge</code> endpoints only answer 302 redirects to the page, so links already handed out keep working. Bundles are stateless and permanent: the id encodes the search itself. Caps are explicit: search reports <code>total</code>; bundles cap at 120 events and say so via <code>truncated</code>.</p>
		<pre>curl "${base}/bundle?month=3&amp;day=19&amp;title=Yud%20Tes%20Kislev"</pre>
	</div>

	<h2>Reference</h2>
	<div class="card">
		<p><code>GET ${base}/options</code> — years, months, days the archive knows.<br>
		<code>GET ${base}/health</code> — service health.<br>
		<code>GET ${base}/</code> — this descriptor as JSON, for agent discovery.<br>
		Errors are JSON: <code>{ ok:false, error:{ code, message } }</code> with a matching HTTP status.</p>
	</div>
	<p class="sub">Source data: Archive.org items per Hebrew year; search shards <code>months-1764928230</code> / <code>days-1764928230</code> — identical to the front end.</p>
</div>
</body>
</html>`;
}

module.exports = { bundlePage, docsPage, esc };
