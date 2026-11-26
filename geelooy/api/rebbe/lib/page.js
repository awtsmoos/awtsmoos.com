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
 * farbrengen/mp3-join.js (joinMp3Blobs) for the lossless merged MP3.
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
			<button class="btn secondary" id="btn-wav" disabled>Download merged WAV (in browser, re-encoded)</button>
			<a class="btn secondary" id="btn-server-zip" href="#" style="display:none">Download ZIP (server)</a>
			<a class="btn secondary" id="btn-server-merge" href="#" style="display:none">Download merged MP3 (server)</a>
		</div>
		<div class="progress" id="progress"><div></div></div>
		<p class="status" id="status"></p>
		<p class="status">ZIP and merged MP3 are assembled on your device from the original Archive.org files — nothing is re-encoded. The merged MP3 joins the original MP3 frames losslessly, exactly like the Rebbe app itself. Some files in this archive are other formats carrying an .mp3 name (e.g. Opus), and mixed MP3 profiles cannot join losslessly; for those, <b>merged WAV</b> decodes everything with Web Audio and re-encodes one combined WAV, and the ZIP always keeps every original file unchanged.</p>
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
		document.getElementById('btn-wav').disabled = !manifest.files.length;
		const serverZip = document.getElementById('btn-server-zip');
		serverZip.href = manifest.links.zipUrl;
		serverZip.style.display = 'inline-block';
		const serverMerge = document.getElementById('btn-server-merge');
		serverMerge.href = manifest.links.mergeDownloadUrl;
		serverMerge.style.display = 'inline-block';
		if (params.get('action') === 'merge') document.getElementById('btn-merge').focus();
		if (params.get('action') === 'zip') document.getElementById('btn-zip').focus();
	} catch (e) {
		document.getElementById('title').textContent = 'Bundle unavailable';
		setStatus(e.message, true);
	}
}
function escapeHtml(s) {
	return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

document.getElementById('btn-zip').addEventListener('click', async () => {
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
});

document.getElementById('btn-merge').addEventListener('click', async () => {
	const btn = document.getElementById('btn-merge');
	btn.disabled = true;
	try {
		const nonMp3 = manifest.files.filter(f => f.format !== 'mp3');
		if (nonMp3.length) throw new Error('Merged MP3 needs all-MP3 files; ' + nonMp3.length + ' file(s) are not MP3. Use the ZIP instead.');
		const { joinMp3Blobs } = await import('/apps/rebbe/modules/download/farbrengen/mp3-join.js');
		const blobs = [];
		for (let i = 0; i < manifest.files.length; i++) {
			blobs.push(await fetchBlob(manifest.files[i], i, manifest.files.length, 'Fetching for merge'));
		}
		setProgress(1, 1, 'Joining MP3 frames (lossless, no re-encoding)…');
		const joined = await joinMp3Blobs(blobs);
		save(joined, 'rebbe-sichos-merged.mp3');
		setStatus('Merged MP3 ready — ' + blobs.length + ' files joined.');
	} catch (e) { setStatus('Browser merge failed: ' + e.message + ' — try "Download merged MP3 (server)", whose joiner resyncs past isolated corrupt frames; the ZIP always keeps every original file unchanged.', true); }
	btn.disabled = false;
});

/**
 * Mixed-format fallback: decode every file with Web Audio (the browser
 * decodes MP3 and the Opus-in-Ogg files this corpus contains), concatenate
 * in an OfflineAudioContext at 44100 Hz, and encode one 16-bit PCM WAV.
 * This re-encodes, so it is the fallback — the MP3 paths above stay lossless.
 */
document.getElementById('btn-wav').addEventListener('click', async () => {
	const btn = document.getElementById('btn-wav');
	btn.disabled = true;
	try {
		if (manifest.totalBytes > 250 * 1024 * 1024) {
			throw new Error('This bundle is ' + fmtBytes(manifest.totalBytes) + '; WAV re-encoding in the browser is capped at 250 MB of source audio. Use the ZIP, which has no such cap.');
		}
		const decodeCtx = new OfflineAudioContext(1, 1, 44100);
		const decoded = [];
		let totalSeconds = 0;
		let channels = 1;
		for (let i = 0; i < manifest.files.length; i++) {
			const file = manifest.files[i];
			setProgress(i, manifest.files.length, 'Decoding for WAV ' + (i + 1) + ' of ' + manifest.files.length + ': ' + file.name);
			const blob = await fetchBlob(file, i, manifest.files.length, 'Fetching for WAV');
			const buffer = await decodeCtx.decodeAudioData(await blob.arrayBuffer());
			decoded.push(buffer);
			totalSeconds += buffer.duration;
			channels = Math.max(channels, buffer.numberOfChannels);
		}
		setProgress(1, 1, 'Rendering combined WAV (' + Math.round(totalSeconds) + 's)…');
		const rate = 44100;
		const offline = new OfflineAudioContext(channels, Math.ceil(totalSeconds * rate), rate);
		let at = 0;
		for (const buffer of decoded) {
			const source = offline.createBufferSource();
			source.buffer = buffer;
			source.connect(offline.destination);
			source.start(at);
			at += buffer.duration;
		}
		const rendered = await offline.startRendering();
		save(encodeWav(rendered), 'rebbe-sichos-merged.wav');
		setStatus('Merged WAV ready — ' + decoded.length + ' files decoded and combined (' + Math.round(totalSeconds) + ' seconds).');
	} catch (e) { setStatus('WAV merge failed: ' + e.message, true); }
	btn.disabled = false;
});

/** Encodes an AudioBuffer as a 16-bit PCM WAV blob. */
function encodeWav(buffer) {
	const channels = buffer.numberOfChannels;
	const rate = buffer.sampleRate;
	const frames = buffer.length;
	const bytesPerSample = 2;
	const blockAlign = channels * bytesPerSample;
	const data = new DataView(new ArrayBuffer(44 + frames * blockAlign));
	const writeText = (offset, text) => { for (let i = 0; i < text.length; i++) data.setUint8(offset + i, text.charCodeAt(i)); };
	writeText(0, 'RIFF');
	data.setUint32(4, 36 + frames * blockAlign, true);
	writeText(8, 'WAVEfmt ');
	data.setUint32(16, 16, true);
	data.setUint16(20, 1, true);
	data.setUint16(22, channels, true);
	data.setUint32(24, rate, true);
	data.setUint32(28, rate * blockAlign, true);
	data.setUint16(32, blockAlign, true);
	data.setUint16(34, 16, true);
	writeText(36, 'data');
	data.setUint32(40, frames * blockAlign, true);
	const channelData = [];
	for (let c = 0; c < channels; c++) channelData.push(buffer.getChannelData(c));
	let offset = 44;
	for (let i = 0; i < frames; i++) {
		for (let c = 0; c < channels; c++) {
			const sample = Math.max(-1, Math.min(1, channelData[c][i]));
			data.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
			offset += 2;
		}
	}
	return new Blob([data.buffer], { type: 'audio/wav' });
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
  "zipUrl":   "${base}/bundle/zip?id=…",
  "mergeUrl": "${base}/bundle/page?id=…&amp;action=merge",
  "manifestUrl": "${base}/bundle/data?id=…",
  "eventCount": 12, "trackCount": 14, "totalBytes": 81234567
}</pre>
		<p>Give the user <b>pageUrl</b>: it lists the bundle and offers <b>Download ZIP</b> and <b>Download merged MP3</b>, both assembled in the browser from the original files (ZIP via the app's own zip-store; merged MP3 = lossless frame join, no re-encoding). <b>zipUrl</b> is a direct server-assembled ZIP download (capped at 300 files / 400 MB; larger bundles return HTTP 413 pointing back to the browser page). <b>mergeDownloadUrl</b> is a direct server-merged MP3: a tolerant lossless frame join that resyncs past isolated corrupt headers the strict browser joiner rejects; it returns HTTP 422 when a segment is not really MP3 (the corpus contains a few Opus files misnamed .mp3) or profiles differ — the ZIP is then the faithful path. Bundles are stateless and permanent: the id encodes the search itself. Caps are explicit: search reports <code>total</code>; bundles cap at 120 events and say so via <code>truncated</code>.</p>
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
