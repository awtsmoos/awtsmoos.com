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
 * bundle is not all true MP3, the page converts instead: Web Audio decodes
 * one track at a time into the vendored lamejs encoder
 * (modules/download/lame.min.js, loaded lazily) - memory-bounded, no WAV.
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
			<button class="btn" id="btn-merge" disabled>Download merged MP3 (in browser)</button>
			<button class="btn secondary" id="btn-cancel" style="display:none">Cancel conversion</button>
		</div>
		<div class="progress" id="progress"><div></div></div>
		<p class="status" id="status"></p>
		<p class="status">ZIP and merged MP3 are assembled on your device from the original Archive.org files. When every file is a true MP3, the merged MP3 joins the original frames losslessly, exactly like the Rebbe app itself. Some files in this archive are other formats carrying an .mp3 name (e.g. Opus); for those, this page decodes each file and <b>converts it to MP3 right here in your browser</b>, one file at a time, so even a many-hour bundle stays light. The ZIP always keeps every original file unchanged.</p>
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

function setStatus(text, isError) {
	statusEl.textContent = text || '';
	statusEl.className = 'status' + (isError ? ' err' : '');
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
async function fetchBlob(file, i, total, verb) {
	setProgress(i, total, verb + ' ' + (i + 1) + ' of ' + total + ': ' + file.name);
	const urls = [file.directUrl, file.downloadUrl].filter(Boolean);
	let lastError = null;
	for (const url of urls) {
		try {
			const res = await fetch(url);
			if (!res.ok) throw new Error('HTTP ' + res.status);
			return await res.blob();
		} catch (e) { lastError = e; }
	}
	throw new Error('Could not fetch ' + file.name + ' (' + (lastError && lastError.message) + ')');
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
	} catch (e) { setStatus(e.message, true); }
	btn.disabled = false;
}
document.getElementById('btn-zip').addEventListener('click', downloadZip);

async function downloadMerge() {
	const btn = document.getElementById('btn-merge');
	btn.disabled = true;
	mergeCancelled = false;
	try {
		// Fetch every file once and sniff its real bytes: the lossless join
		// is used only when EVERY file is truly MP3. Archive metadata lies -
		// some .mp3 files are actually Ogg/Opus (proven on the 5712 bundle,
		// whose BH_009 starts with OggS despite its MP3 label).
		const blobs = [];
		let allMp3 = manifest.files.every(f => f.format === 'mp3');
		for (let i = 0; i < manifest.files.length; i++) {
			const blob = await fetchBlob(manifest.files[i], i, manifest.files.length, 'Fetching for merge');
			if (allMp3 && !(await blobIsMp3(blob))) allMp3 = false;
			blobs.push(blob);
		}
		let joined = null;
		if (allMp3) {
			try {
				const { joinMp3Blobs } = await import('/apps/rebbe/modules/download/farbrengen/mp3-join.js');
				setProgress(1, 1, 'Joining MP3 frames (lossless, no re-encoding)...');
				joined = await joinMp3Blobs(blobs);
			} catch (joinError) {
				setStatus('Lossless join not possible for these files (' + joinError.message + ') - converting to MP3 instead...');
				joined = null;
			}
		}
		if (joined) {
			save(joined, 'rebbe-sichos-merged.mp3');
			setStatus('Merged MP3 ready - ' + blobs.length + ' files joined losslessly.');
		} else {
			await convertToMp3(blobs);
		}
	} catch (e) { setStatus('Browser merge failed: ' + e.message + ' - the ZIP always keeps every original file unchanged.', true); }
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
 * Mixed-format path: decode ONE track at a time with Web Audio and encode
 * it to MP3 incrementally with lamejs (128 kbps stereo / 96 kbps mono -
 * speech-appropriate). Memory stays bounded: at most one decoded
 * AudioBuffer plus the encoded MP3 chunks are ever alive; each compressed
 * blob and each decoded buffer is released before the next track starts.
 * (The old uncompressed path decoded EVERYTHING into one giant PCM
 * buffer and crashed the page on long bundles - Hai's ruling,
 * 2026-11-26: convert to MP3 in the browser instead.)
 */
async function convertToMp3(blobs) {
	const lamejs = await loadMp3Encoder();
	const cancelBtn = document.getElementById('btn-cancel');
	cancelBtn.style.display = 'inline-block';
	const decodeCtx = new OfflineAudioContext(1, 1, 44100);
	const chunks = [];
	let encoder = null;
	let channels = 2;
	let totalSeconds = 0;
	try {
		for (let i = 0; i < blobs.length; i++) {
			if (mergeCancelled) throw new Error('Conversion cancelled.');
			const file = manifest.files[i];
			setProgress(i, blobs.length, 'Converting ' + (i + 1) + ' of ' + blobs.length + ': ' + file.name);
			let buffer = await decodeCtx.decodeAudioData(await blobs[i].arrayBuffer());
			blobs[i] = null; // release the compressed blob before encoding
			if (!encoder) {
				channels = Math.min(2, Math.max(1, buffer.numberOfChannels));
				encoder = new lamejs.Mp3Encoder(channels, buffer.sampleRate, channels === 2 ? 128 : 96);
			}
			encodeTrack(encoder, buffer, channels, chunks);
			totalSeconds += buffer.duration;
			buffer = null; // release the decoded PCM before the next track
		}
		if (mergeCancelled) throw new Error('Conversion cancelled.');
		setProgress(1, 1, 'Finishing MP3...');
		const tail = encoder.flush();
		if (tail.length) chunks.push(new Blob([tail]));
		save(new Blob(chunks, { type: 'audio/mpeg' }), 'rebbe-sichos-merged.mp3');
		setStatus('Merged MP3 ready - ' + manifest.files.length + ' files converted and combined (' + Math.round(totalSeconds) + ' seconds).');
	} finally {
		cancelBtn.style.display = 'none';
	}
}

/** Encodes one decoded AudioBuffer into the shared encoder, in small blocks. */
function encodeTrack(encoder, buffer, channels, chunks) {
	const left = buffer.getChannelData(0);
	const right = buffer.numberOfChannels > 1 ? buffer.getChannelData(1) : left;
	const BLOCK = 1152 * 32;
	for (let off = 0; off < left.length; off += BLOCK) {
		if (mergeCancelled) throw new Error('Conversion cancelled.');
		const end = Math.min(off + BLOCK, left.length);
		const l16 = floatTo16(left, off, end);
		let data;
		if (channels === 2) data = encoder.encodeBuffer(l16, floatTo16(right, off, end));
		else data = encoder.encodeBuffer(l16);
		if (data.length) chunks.push(new Blob([data]));
	}
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
		<p>Give the user <b>pageUrl</b> \u2014 it is THE download link. The page lists the bundle and offers <b>Download ZIP</b> and <b>Download merged MP3</b>, all assembled in the user's own browser from the original Archive.org files (ZIP via the app's own zip-store; merged MP3 = lossless frame join when every file is true MP3; when a bundle contains other formats under an .mp3 name, e.g. Opus, the page converts instead - Web Audio decodes one track at a time into a vendored lamejs MP3 encoder, so memory stays bounded even on many-hour bundles). <b>zipUrl</b> and <b>mergeUrl</b> are the same page focused on that action, and opening one starts that download in the browser. The server never downloads the audio: the legacy <code>${base}/bundle/zip</code> and <code>${base}/bundle/merge</code> endpoints only answer 302 redirects to the page, so links already handed out keep working. Bundles are stateless and permanent: the id encodes the search itself. Caps are explicit: search reports <code>total</code>; bundles cap at 120 events and say so via <code>truncated</code>.</p>
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
