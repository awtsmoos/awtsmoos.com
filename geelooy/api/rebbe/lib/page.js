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
 *
 * Conversion runs in a dedicated background worker (lib/convert-worker.js,
 * served at /bundle/worker.js) so it survives the tab being hidden: the
 * pipeline is driven by codec callbacks, a screen wake lock is held, each
 * finished track is persisted to OPFS for resume after a reload or tab
 * kill, and a service worker (lib/service-worker.js, /sw.js) carries
 * progress / completion notifications. The shared conversion engine
 * itself lives in lib/engine.js and is evaluated in both contexts.
 */

const { API_VERSION } = require("./response.js");
const { ENGINE_JS } = require("./engine.js");

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
			<button class="btn secondary" id="btn-resume" style="display:none">Resume conversion</button>
			<button class="btn secondary" id="btn-ready" style="display:none">Download ready file</button>
			<button class="btn secondary" id="btn-notify" style="display:none">Enable notifications</button>
		</div>
		<div class="progress" id="progress"><div></div></div>
		<p class="status" id="status"></p>
		<p class="status">ZIP and the merged file are assembled on your device from the original Archive.org files - the server never downloads or converts anything. When every file is a true MP3, the merged file is an <b>MP3</b>: the original frames joined losslessly, exactly like the Rebbe app itself. Some files in this archive are other formats carrying an .mp3 name (e.g. Opus); those bundles are <b>converted right here in your browser</b> into one merged <b>Opus</b> file (.opus) with your browser's native media encoder - near-instant, one file at a time, so even a many-hour bundle stays light. (Browsers without the native encoder fall back to a slower built-in MP3 conversion.) The ZIP always keeps every original file unchanged. Conversion runs in a background worker and holds a screen wake lock, so you can leave this tab while it works; progress is saved on your device track by track, and if the page is closed mid-conversion, reopening it offers to resume where it stopped. Allow notifications and you will be told as the work finishes and when your merged file is ready.</p>
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
		registerServiceWorker();
		partialMeta = await readPartialMeta(bundleKey());
		if (partialMeta && partialMeta.engine === 'webcodecs-opus' && partialMeta.total === manifest.files.length) {
			const doneCount = (partialMeta.done || []).length;
			bgState.resume = { available: true, doneTracks: doneCount, total: partialMeta.total, complete: !!partialMeta.complete };
			if (partialMeta.complete) {
				document.getElementById('btn-ready').style.display = 'inline-block';
				setStatus('Your merged Opus file from an earlier conversion is saved on this device - tap "Download ready file".');
			} else if (doneCount > 0 || (partialMeta.skipped || []).length) {
				document.getElementById('btn-resume').style.display = 'inline-block';
				setStatus('An earlier conversion of this bundle stopped after ' + doneCount + ' of ' + partialMeta.total + ' tracks. Resume keeps every finished track - nothing is downloaded or converted twice.');
			}
		}
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
document.getElementById('btn-merge').addEventListener('click', () => { mergeFromGesture = true; maybeRequestNotifications(); downloadMerge(); });

let mergeCancelled = false;
document.getElementById('btn-cancel').addEventListener('click', () => {
	if (workerRun) workerRun.worker.postMessage({ type: 'cancel', key: workerRun.key });
	else mergeCancelled = true;
});

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

${ENGINE_JS}

/* ============ Background conversion: worker, wake lock, notifications, resume ============ */

/**
 * Background state for the worker conversion, published on
 * window.__rebbeBackground and inside window.__rebbeConvert: which
 * pieces are active (worker, wake lock, notifications, service worker)
 * and what resume state exists. The conversion itself runs in a
 * dedicated worker (BASE + '/bundle/worker.js') whose pipeline is
 * driven by codec callbacks - a hidden tab throttles main-thread
 * timers, but the worker keeps converting, and every finished track is
 * persisted to OPFS so a killed or reloaded page resumes instead of
 * starting over.
 */
const bgState = {
	worker: false,
	wakeLock: 'unknown',
	notifications: (typeof Notification !== 'undefined') ? Notification.permission : 'unsupported',
	serviceWorker: false,
	resume: null
};
window.__rebbeBackground = bgState;
let swRegistration = null;
let wakeLock = null;
let conversionRunning = false;
let workerRun = null;
let workerDeclineReason = '';
let mergeFromGesture = false;
let partialMeta = null;

/** Registers the notification service worker (scope: this API). */
async function registerServiceWorker() {
	if (!('serviceWorker' in navigator)) { bgState.serviceWorker = false; return; }
	try {
		swRegistration = await navigator.serviceWorker.register(BASE + '/sw.js');
		bgState.serviceWorker = true;
	} catch (e) { bgState.serviceWorker = false; }
}

/**
 * Asks for notification permission when there is a user gesture to ride
 * on; without one (auto-started runs) it surfaces the Enable
 * notifications button instead of prompting cold. Denial is respected
 * silently - status line only.
 */
async function maybeRequestNotifications() {
	if (typeof Notification === 'undefined') { bgState.notifications = 'unsupported'; return; }
	bgState.notifications = Notification.permission;
	if (Notification.permission !== 'default') return;
	if (mergeFromGesture) {
		try { bgState.notifications = await Notification.requestPermission(); } catch (e) {}
		if (bgState.notifications !== 'default') document.getElementById('btn-notify').style.display = 'none';
	} else {
		document.getElementById('btn-notify').style.display = 'inline-block';
	}
}

/** Shows a notification through the service worker - only while hidden. */
function notifyUser(title, body, tag) {
	try {
		if (!swRegistration || typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
		if (!document.hidden) return;
		swRegistration.showNotification(title, { body, tag: tag || 'rebbe-convert', data: { url: location.href } });
	} catch (e) {}
}

/** Holds a screen wake lock for the length of a conversion. */
async function acquireWakeLock() {
	if (!('wakeLock' in navigator)) { bgState.wakeLock = 'unsupported'; return; }
	try {
		wakeLock = await navigator.wakeLock.request('screen');
		bgState.wakeLock = 'held';
		wakeLock.addEventListener('release', () => {
			bgState.wakeLock = 'released';
			wakeLock = null;
			if (conversionRunning && !document.hidden) acquireWakeLock();
		});
	} catch (e) { bgState.wakeLock = 'error'; }
}
function releaseWakeLock() {
	if (wakeLock) { try { wakeLock.release(); } catch (e) {} wakeLock = null; }
	bgState.wakeLock = 'released';
}
document.addEventListener('visibilitychange', () => {
	if (!document.hidden && conversionRunning && !wakeLock) acquireWakeLock();
});

/** FNV-1a key over the bundle id + track list - the OPFS store key. */
function bundleKey() {
	if (!manifest) return '';
	let h = 0x811c9dc5;
	const s = id + '|' + manifest.files.map(f => f.name + ':' + (f.size || 0)).join('|');
	for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); }
	return (h >>> 0).toString(16);
}

/** Reads a previous conversion's saved state (OPFS) for this bundle, if any. */
async function readPartialMeta(key) {
	try {
		if (!key || !navigator.storage || !navigator.storage.getDirectory) return null;
		const root = await navigator.storage.getDirectory();
		const dir = await root.getDirectoryHandle('rebbe-convert-' + key, { create: false });
		const fh = await dir.getFileHandle('meta.json', { create: false });
		const file = await fh.getFile();
		return JSON.parse(await file.text());
	} catch (e) { return null; }
}

/**
 * Runs the conversion in the dedicated worker and renders its progress.
 * Resolves 'done' when the merged file was saved, 'declined' when the
 * worker cannot take this bundle (the dispatcher then falls back to
 * lamejs), and rejects on error / cancel / a dead worker (the watchdog:
 * no worker message for 45s while running - Retry then resumes from
 * the last persisted track, because the worker stores every track).
 */
function runWorkerConversion() {
	return new Promise((resolveRun, rejectRun) => {
		const key = bundleKey();
		const worker = new Worker(BASE + '/bundle/worker.js');
		bgState.worker = true;
		conversionRunning = true;
		acquireWakeLock();
		maybeRequestNotifications();
		const cancelBtn = document.getElementById('btn-cancel');
		const skipBtn = document.getElementById('btn-skip');
		cancelBtn.style.display = 'inline-block';
		skipBtn.style.display = 'inline-block';
		let lastMsgAt = Date.now();
		let settled = false;
		const finish = (fn, val, delay) => {
			if (settled) return;
			settled = true;
			clearInterval(watchdog);
			workerRun = null;
			conversionRunning = false;
			releaseWakeLock();
			cancelBtn.style.display = 'none';
			skipBtn.style.display = 'none';
			setTimeout(() => { try { worker.terminate(); } catch (e) {} }, delay || 0);
			fn(val);
		};
		workerRun = { worker, key };
		const watchdog = setInterval(() => {
			if (Date.now() - lastMsgAt > 45000) {
				finish(rejectRun, new Error('The conversion worker stopped responding - press Retry to resume from the last finished track.'));
			}
		}, 5000);
		worker.onerror = e => finish(rejectRun, new Error('Conversion worker failed: ' + (e.message || 'unknown error')));
		worker.onmessage = e => {
			const msg = e.data || {};
			lastMsgAt = Date.now();
			if (msg.type === 'progress') {
				setProgress(msg.done, msg.total, msg.label);
			} else if (msg.type === 'probe') {
				if (window.__rebbeConvert) window.__rebbeConvert.workerProbe = msg.support;
			} else if (msg.type === 'started') {
				bgState.resume = { available: msg.resumed, doneTracks: msg.doneTracks, total: msg.total };
				if (msg.resumed) setStatus('Resuming conversion - ' + msg.doneTracks + ' of ' + msg.total + ' tracks were saved on this device and are not being redone...');
			} else if (msg.type === 'track-done') {
				bgState.resume = { available: true, doneTracks: msg.index + 1, total: msg.total };
				notifyUser(manifest.title, 'Track ' + (msg.index + 1) + ' of ' + msg.total + ' - ' + Math.round((msg.index + 1) / msg.total * 100) + '% converted', 'rebbe-convert-progress');
			} else if (msg.type === 'done') {
				save(msg.blob, 'rebbe-sichos-merged.opus');
				setStatus('Merged Opus ready - ' + msg.converted + ' of ' + msg.total + ' files converted and combined (' + Math.round(msg.totalSeconds) + ' seconds' + (msg.skipped ? ', ' + msg.skipped + ' skipped' : '') + (msg.resumed ? ', resumed from progress saved on this device' : '') + ', native media encoder in a background worker, converted in your browser).');
				notifyUser(manifest.title, 'Merged file ready - tap to open the page and save it', 'rebbe-convert-done');
				worker.postMessage({ type: 'ack-saved', key });
				finish(resolveRun, 'done', 500);
			} else if (msg.type === 'declined') {
				workerDeclineReason = msg.reason || '';
				finish(resolveRun, 'declined');
			} else if (msg.type === 'cancelled') {
				finish(rejectRun, new Error('Conversion cancelled.'));
			} else if (msg.type === 'error') {
				notifyUser(manifest.title, 'Conversion hit a problem: ' + msg.message, 'rebbe-convert-error');
				finish(rejectRun, new Error(msg.message));
			}
		};
		worker.postMessage({ type: 'start', files: manifest.files, key, title: manifest.title });
	});
}

/** Assembles and saves a merged file a previous visit already completed. */
async function assembleReadyFile() {
	const btn = document.getElementById('btn-ready');
	btn.disabled = true;
	try {
		const key = bundleKey();
		const blob = await new Promise((resolveP, rejectP) => {
			const w = new Worker(BASE + '/bundle/worker.js');
			const to = setTimeout(() => { try { w.terminate(); } catch (e) {} rejectP(new Error('The stored conversion could not be assembled in time.')); }, 120000);
			w.onmessage = e => {
				const m = e.data || {};
				if (m.type === 'done') {
					clearTimeout(to);
					w.postMessage({ type: 'ack-saved', key });
					setTimeout(() => { try { w.terminate(); } catch (err) {} }, 500);
					resolveP(m.blob);
				} else if (m.type === 'error') {
					clearTimeout(to);
					try { w.terminate(); } catch (err) {}
					rejectP(new Error(m.message));
				}
			};
			w.onerror = () => { clearTimeout(to); rejectP(new Error('Conversion worker failed to start.')); };
			w.postMessage({ type: 'assemble', key, total: manifest.files.length });
		});
		save(blob, 'rebbe-sichos-merged.opus');
		setStatus('Merged Opus ready - assembled from the conversion saved on this device.');
		btn.style.display = 'none';
		bgState.resume = null;
	} catch (e) { showFailure(e.message); }
	btn.disabled = false;
}

/**
 * Conversion dispatcher: the native WebCodecs Opus path first, running
 * in the background worker (near-instant, fully in the browser,
 * resumable), the async lamejs MP3 path only when the browser has no
 * WebCodecs Opus encoder or the worker declines this bundle's formats -
 * the user always sees which file they are getting (Opus vs MP3) in the
 * status line and the saved filename. The chosen engine and the
 * background state are published on window.__rebbeConvert so the page's
 * behavior is observable (support probes, browser tests, support).
 */
async function convertMergedAudio(getBlob) {
	const support = await probeWebCodecs();
	window.__rebbeConvert = {
		engine: support.opusEncode ? 'webcodecs-opus' : 'lamejs',
		reason: support.reason || '',
		webCodecs: support,
		background: bgState,
		startedAt: new Date().toISOString()
	};
	if (support.opusEncode) {
		const outcome = await runWorkerConversion();
		if (outcome === 'done') { window.__rebbeConvert.done = true; return; }
		window.__rebbeConvert.engine = 'lamejs';
		window.__rebbeConvert.reason = 'media-encoder worker declined: ' + workerDeclineReason;
		setStatus('The background media-encoder conversion cannot take this bundle (' + workerDeclineReason + ') - switching to the built-in MP3 converter...');
		await yieldToUi();
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

document.getElementById('btn-skip').addEventListener('click', () => {
	if (workerRun) workerRun.worker.postMessage({ type: 'skip' });
	else skipRequested = true;
});
document.getElementById('btn-resume').addEventListener('click', () => { mergeFromGesture = true; maybeRequestNotifications(); downloadMerge(); });
document.getElementById('btn-ready').addEventListener('click', assembleReadyFile);
document.getElementById('btn-notify').addEventListener('click', async () => {
	mergeFromGesture = true;
	await maybeRequestNotifications();
	if (bgState.notifications !== 'default') document.getElementById('btn-notify').style.display = 'none';
});
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
