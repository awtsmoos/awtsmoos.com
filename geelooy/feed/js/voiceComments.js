// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module VoiceComments
 * @description
 * Yaakov 2026-10-13: TRACK C — voice comments for the Awtsmoos feed.
 *
 * 1. A microphone button is injected into every comment composer
 *    (top-level `.feed-comment-form` and inline reply forms alike).
 * 2. Tapping it opens the recorder modal: live level meter, running timer,
 *    hard stop at 2 minutes (120 seconds).
 * 3. After stopping, the reader previews the take with a waveform + play
 *    button, then posts it or re-records.
 * 4. Voice comments render at the top of the card's comment thread with a
 *    custom play/pause button and a waveform that fills as the audio plays.
 *
 * Persistence: there is no server route for audio uploads yet, so voice
 * comments live on the reader's own device. Metadata + amplitude peaks are
 * always kept in localStorage; the audio itself is kept as a data URL when
 * small enough (~1.8MB) and otherwise stays in memory for the session.
 * Posting attempts `VOICE_UPLOAD_ENDPOINT` when one is configured.
 *
 * Yaakov's rules honored: no `!important`, sharp corners, token-only colors
 * with explicit light/dark handling in the sibling CSS, overflow-x clipped,
 * never shows raw IDs or machine slugs, and a clear fallback message when
 * the microphone is unavailable. Works on mobile (getUserMedia + playsinline).
 */

export const VOICE_UPLOAD_ENDPOINT = null; // no server route yet — see note above

const MAX_SECONDS = 120; // Yaakov: 2-minute cap
const LS_PREFIX = 'awtsmoos-voice-comments:';
const LS_MAX_PER_POST = 25;
const DATA_URL_BYTE_CAP = 1.8 * 1024 * 1024;
const WAVE_BARS = 48;

/* ------------------------------------------------------------------ */
/* small helpers                                                       */
/* ------------------------------------------------------------------ */

function escapeHtml(s) {
	return String(s ?? '').replace(/[&<>"']/g, c => ({
		'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
	}[c]));
}

function currentAlias() {
	return window.curAlias || window.currentAlias ||
		document.body?.dataset?.aliasId ||
		localStorage.getItem('awtsmoos-alias') || 'anonymous';
}

function displayName() {
	return window.curAliasName || localStorage.getItem('awtsmoos-alias-name') ||
		(currentAlias() === 'anonymous' ? 'A reader' : 'A reader');
}

function readJson(key, fallback) {
	try {
		const raw = localStorage.getItem(key);
		if (!raw) return fallback;
		const parsed = JSON.parse(raw);
		return parsed === null || parsed === undefined ? fallback : parsed;
	} catch (_) { return fallback; }
}

function writeJson(key, value) {
	try { localStorage.setItem(key, JSON.stringify(value)); }
	catch (_) { /* quota / private mode — the feed still works */ }
}

function formatClock(totalSeconds) {
	const s = Math.max(0, Math.floor(totalSeconds));
	const m = Math.floor(s / 60);
	return `${m}:${String(s % 60).padStart(2, '0')}`;
}

function postKey(postId) { return LS_PREFIX + String(postId); }

function loadVoiceComments(postId) {
	const list = readJson(postKey(postId), []);
	return Array.isArray(list) ? list : [];
}

function saveVoiceComment(postId, record) {
	const list = loadVoiceComments(postId);
	list.unshift(record);
	writeJson(postKey(postId), list.slice(0, LS_MAX_PER_POST));
}

/* ------------------------------------------------------------------ */
/* waveform math                                                       */
/* ------------------------------------------------------------------ */

/** Resamples a peaks array to exactly WAVE_BARS bars, values in 0..1. */
function barsFromPeaks(peaks) {
	const src = Array.isArray(peaks) && peaks.length ? peaks : [0.2];
	const out = [];
	for (let i = 0; i < WAVE_BARS; i++) {
		const idx = Math.floor((i / WAVE_BARS) * src.length);
		out.push(Math.min(1, Math.max(0.04, src[Math.min(idx, src.length - 1)] || 0)));
	}
	return out;
}

/**
 * Draws the bar waveform into a canvas. `progress` (0..1) tints the played
 * portion gold; the rest stays soft.
 */
function paintWaveform(canvas, bars, progress = 0) {
	const dpr = Math.min(2, window.devicePixelRatio || 1);
	const w = canvas.clientWidth || canvas.width || 220;
	const h = canvas.clientHeight || canvas.height || 40;
	canvas.width = Math.round(w * dpr);
	canvas.height = Math.round(h * dpr);
	const ctx = canvas.getContext('2d');
	ctx.scale(dpr, dpr);
	ctx.clearRect(0, 0, w, h);
	const gap = 2;
	const bw = (w - gap * (bars.length - 1)) / bars.length;
	const playedBars = Math.floor(progress * bars.length);
	const played = getComputedStyle(document.documentElement).getPropertyValue('--accent-gold').trim() || '#d4a94e';
	const rest = getComputedStyle(document.documentElement).getPropertyValue('--aw-text-soft').trim() || '#8a93a3';
	for (let i = 0; i < bars.length; i++) {
		const bh = Math.max(2, bars[i] * h);
		const x = i * (bw + gap);
		ctx.fillStyle = i < playedBars ? played : rest;
		ctx.fillRect(x, (h - bh) / 2, bw, bh);
	}
}

/* ------------------------------------------------------------------ */
/* mic / recorder plumbing                                             */
/* ------------------------------------------------------------------ */

function pickMimeType() {
	if (typeof MediaRecorder === 'undefined' || !MediaRecorder.isTypeSupported) return '';
	const candidates = [
		'audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/mpeg', ''
	];
	for (const t of candidates) {
		try { if (!t || MediaRecorder.isTypeSupported(t)) return t; } catch (_) {}
	}
	return '';
}

/**
 * Human-readable reason why the mic is unavailable, or null when recording
 * is possible. Never exposes raw IDs or machine slugs.
 */
function micUnavailableReason() {
	if (typeof MediaRecorder === 'undefined') {
		return 'This browser cannot record audio. Please type your comment instead.';
	}
	if (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== 'function') {
		if (window.isSecureContext === false) {
			return 'Voice comments need a secure connection (https). Please type your comment instead.';
		}
		return 'This browser blocked microphone access. Please type your comment instead.';
	}
	return null;
}

async function openMicStream() {
	const constraints = {
		audio: {
			echoCancellation: true,
			noiseSuppression: true,
			autoGainControl: true
		}
	};
	return navigator.mediaDevices.getUserMedia(constraints);
}

/* ------------------------------------------------------------------ */
/* the recorder modal                                                  */
/* ------------------------------------------------------------------ */

let modalOpen = false;

function svgMic() {
	return '<svg class="vc-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><rect x="9" y="3.5" width="6" height="11" rx="3"/><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3.5"/></svg>';
}
function svgPlay() {
	return '<svg class="vc-ic" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="M8 5.5v13l11-6.5z"/></svg>';
}
function svgPause() {
	return '<svg class="vc-ic" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="7" y="5" width="3.4" height="14"/><rect x="13.6" y="5" width="3.4" height="14"/></svg>';
}
function svgStop() {
	return '<svg class="vc-ic" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="7" y="7" width="10" height="10"/></svg>';
}

function closeModal(modal) {
	modalOpen = false;
	modal.remove();
	document.removeEventListener('keydown', modal._onKey, true);
}

/**
 * Opens the recorder for a post. `onPosted(record)` lets the card refresh its
 * thread; the voice row is also rendered immediately by this module.
 */
export function openVoiceComposer({ postId, onPosted }) {
	if (modalOpen) return;
	const blocked = micUnavailableReason();
	const modal = document.createElement('div');
	modal.className = 'vc-modal-backdrop';
	modal.innerHTML =
		'<div class="vc-modal" role="dialog" aria-modal="true" aria-label="Record a voice comment">' +
			'<div class="vc-modal-head">' +
				'<h2 class="vc-modal-title">Voice comment</h2>' +
				'<button type="button" class="vc-close" aria-label="Close voice recorder">✕</button>' +
			'</div>' +
			'<div class="vc-modal-body"></div>' +
		'</div>';
	document.body.append(modal);
	modalOpen = true;
	const body = modal.querySelector('.vc-modal-body');
	const onKey = (e) => { if (e.key === 'Escape') teardown(); };
	modal._onKey = onKey;
	document.addEventListener('keydown', onKey, true);
	modal.querySelector('.vc-close').addEventListener('click', teardown);
	modal.addEventListener('click', (e) => { if (e.target === modal) teardown(); });

	let recorder = null, stream = null, analyser = null, audioCtx = null;
	let chunks = [], peaks = [], rafId = 0, tickTimer = 0;
	let startedAt = 0, stopped = false, audioUrl = null, audioBlob = null, mimeType = '';

	function teardown() {
		cancelAnimationFrame(rafId);
		clearInterval(tickTimer);
		try { recorder && recorder.state !== 'inactive' && recorder.stop(); } catch (_) {}
		try { stream && stream.getTracks().forEach(t => t.stop()); } catch (_) {}
		try { audioCtx && audioCtx.close(); } catch (_) {}
		if (audioUrl) URL.revokeObjectURL(audioUrl);
		closeModal(modal);
	}

	if (blocked) {
		body.innerHTML =
			'<div class="vc-fallback" role="alert">' +
				'<p class="vc-fallback-title">Microphone unavailable</p>' +
				`<p class="vc-fallback-text">${escapeHtml(blocked)}</p>` +
				'<button type="button" class="vc-btn vc-btn-primary vc-fallback-ok">Type my comment instead</button>' +
			'</div>';
		body.querySelector('.vc-fallback-ok').addEventListener('click', teardown);
		return { close: teardown };
	}

	body.innerHTML =
		'<p class="vc-hint">Record up to 2 minutes. Speak clearly — your voice comment posts on this device.</p>' +
		'<div class="vc-timer-row"><span class="vc-timer" aria-live="polite">0:00</span><span class="vc-timer-cap">/ 2:00</span></div>' +
		'<canvas class="vc-live-wave" aria-hidden="true"></canvas>' +
		'<div class="vc-rec-controls">' +
			'<button type="button" class="vc-btn vc-btn-record" aria-label="Start recording">' + svgMic() + '<span>Record</span></button>' +
		'</div>' +
		'<p class="vc-error" role="alert" hidden></p>';

	const timerEl = body.querySelector('.vc-timer');
	const liveCanvas = body.querySelector('.vc-live-wave');
	const controls = body.querySelector('.vc-rec-controls');
	const errorEl = body.querySelector('.vc-error');
	const showError = (msg) => { errorEl.textContent = msg; errorEl.hidden = false; };

	/** Live meter: RMS of the analyser time-domain data, sampled ~10fps. */
	function pumpMeter() {
		const buf = new Uint8Array(analyser.fftSize);
		analyser.getByteTimeDomainData(buf);
		let sum = 0;
		for (let i = 0; i < buf.length; i += 4) {
			const v = (buf[i] - 128) / 128;
			sum += v * v;
		}
		const rms = Math.min(1, Math.sqrt(sum / (buf.length / 4)) * 2.2);
		peaks.push(rms);
		paintWaveform(liveCanvas, barsFromPeaks(peaks.slice(-WAVE_BARS)), 0);
		rafId = requestAnimationFrame(pumpMeter);
	}

	async function startRecording() {
		errorEl.hidden = true;
		try {
			stream = await openMicStream();
		} catch (err) {
			const name = err && err.name;
			showError(name === 'NotAllowedError'
				? 'Microphone access was blocked. Enable it in your browser settings, or type your comment instead.'
				: 'The microphone could not be started. Please type your comment instead.');
			return;
		}
		mimeType = pickMimeType();
		chunks = [];
		peaks = [];
		try {
			recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
		} catch (_) {
			showError('Recording is not supported here. Please type your comment instead.');
			stream.getTracks().forEach(t => t.stop());
			stream = null;
			return;
		}
		recorder.ondataavailable = (e) => { if (e.data && e.data.size) chunks.push(e.data); };
		recorder.onerror = () => showError('Recording failed. Please try again.');
		recorder.onstop = onStopped;
		try {
			audioCtx = new (window.AudioContext || window.webkitAudioContext)();
			const src = audioCtx.createMediaStreamSource(stream);
			analyser = audioCtx.createAnalyser();
			analyser.fftSize = 512;
			src.connect(analyser);
		} catch (_) { analyser = null; }
		recorder.start(250);
		startedAt = Date.now();
		stopped = false;
		controls.innerHTML =
			'<button type="button" class="vc-btn vc-btn-stop" aria-label="Stop recording">' + svgStop() + '<span>Stop</span></button>';
		controls.querySelector('.vc-btn-stop').addEventListener('click', stopRecording);
		paintWaveform(liveCanvas, new Array(WAVE_BARS).fill(0.06), 0);
		if (analyser) pumpMeter();
		// Hard 2-minute cap.
		tickTimer = setInterval(() => {
			const elapsed = Math.floor((Date.now() - startedAt) / 1000);
			timerEl.textContent = formatClock(Math.min(elapsed, MAX_SECONDS));
			if (elapsed >= MAX_SECONDS) stopRecording(true);
		}, 250);
	}

	function stopRecording(atCap = false) {
		if (stopped) return;
		stopped = true;
		clearInterval(tickTimer);
		cancelAnimationFrame(rafId);
		if (atCap) showError('Reached the 2-minute limit — posting what you recorded.');
		try { recorder && recorder.state !== 'inactive' && recorder.stop(); } catch (_) {}
	}

	function onStopped() {
		const elapsed = Math.min(MAX_SECONDS, Math.floor((Date.now() - startedAt) / 1000));
		audioBlob = new Blob(chunks, { type: mimeType || 'audio/webm' });
		if (!audioBlob.size) {
			showError('Nothing was recorded. Please try again.');
			controls.innerHTML = '';
			return;
		}
		if (audioUrl) URL.revokeObjectURL(audioUrl);
		audioUrl = URL.createObjectURL(audioBlob);
		const bars = barsFromPeaks(peaks.length ? peaks : [0.2]);
		// Preview: play button + waveform + duration, then Send / Re-record.
		body.innerHTML =
			'<p class="vc-hint">Preview your voice comment:</p>' +
			'<div class="vc-preview">' +
				'<button type="button" class="vc-play" aria-label="Play preview">' + svgPlay() + '</button>' +
				'<canvas class="vc-wave" aria-hidden="true"></canvas>' +
				`<span class="vc-duration">${formatClock(elapsed)}</span>` +
			'</div>' +
			'<div class="vc-preview-controls">' +
				'<button type="button" class="vc-btn vc-btn-primary vc-send">Post voice comment</button>' +
				'<button type="button" class="vc-btn vc-rerecord">Re-record</button>' +
			'</div>' +
			'<p class="vc-error" role="alert" hidden></p>';
		const canvas = body.querySelector('.vc-wave');
		const playBtn = body.querySelector('.vc-play');
		const audio = new Audio(audioUrl);
		audio.playsInline = true;
		audio.preload = 'auto';
		paintWaveform(canvas, bars, 0);
		let playing = false;
		playBtn.addEventListener('click', () => {
			if (playing) { audio.pause(); return; }
			audio.play().catch(() => showError('Playback failed. The recording is still saved below.'));
		});
		audio.addEventListener('play', () => { playing = true; playBtn.innerHTML = svgPause(); playBtn.setAttribute('aria-label', 'Pause preview'); });
		audio.addEventListener('pause', () => { playing = false; playBtn.innerHTML = svgPlay(); playBtn.setAttribute('aria-label', 'Play preview'); });
		audio.addEventListener('timeupdate', () => {
			paintWaveform(canvas, bars, audio.duration ? audio.currentTime / audio.duration : 0);
		});
		audio.addEventListener('ended', () => paintWaveform(canvas, bars, 0));
		// Resize keeps the waveform crisp.
		const repaint = () => paintWaveform(canvas, bars, audio.duration ? audio.currentTime / audio.duration : 0);
		window.addEventListener('resize', repaint);
		const cleanupAudio = () => { audio.pause(); window.removeEventListener('resize', repaint); };

		body.querySelector('.vc-rerecord').addEventListener('click', () => {
			cleanupAudio();
			teardown();
			openVoiceComposer({ postId, onPosted });
		});

		body.querySelector('.vc-send').addEventListener('click', async () => {
			const btn = body.querySelector('.vc-send');
			btn.disabled = true;
			const record = {
				id: `vc-${Date.now().toString(36)}`,
				postId: String(postId),
				author: displayName(),
				alias: currentAlias(),
				at: Date.now(),
				durationSec: elapsed,
				peaks: peaks.length ? peaks.map(p => +p.toFixed(3)).slice(0, 1500) : [0.2],
				mime: audioBlob.type || 'audio/webm',
				dataUrl: null,
				blob: audioBlob,
				url: audioUrl
			};
			// Keep the audio object-URL alive past modal close: it stays valid
			// for the session because the blob is referenced by the record.
			audioUrl = null;
			// Persist a data URL only when small enough for localStorage.
			try {
				if (audioBlob.size <= DATA_URL_BYTE_CAP) {
					record.dataUrl = await blobToDataUrl(audioBlob);
				}
			} catch (_) {}
			const { blob: _b, url: _u, ...persistable } = record;
			saveVoiceComment(postId, persistable);
			if (VOICE_UPLOAD_ENDPOINT) {
				try {
					const fd = new FormData();
					fd.append('audio', audioBlob, `voice.${extFor(record.mime)}`);
					fd.append('postId', String(postId));
					fd.append('durationSec', String(elapsed));
					await fetch(VOICE_UPLOAD_ENDPOINT, { method: 'POST', credentials: 'same-origin', body: fd });
				} catch (_) { /* local copy is the source of truth for now */ }
			}
			cleanupAudio();
			teardown();
			renderVoiceListForCard(postId);
			if (typeof onPosted === 'function') {
				try { onPosted(record); } catch (_) {}
			}
		});
	}

	body.querySelector('.vc-btn-record').addEventListener('click', startRecording);
	return { close: teardown };
}

function blobToDataUrl(blob) {
	return new Promise((resolve, reject) => {
		const r = new FileReader();
		r.onload = () => resolve(String(r.result));
		r.onerror = () => reject(r.error);
		r.readAsDataURL(blob);
	});
}

function extFor(mime) {
	if (/mp4/i.test(mime)) return 'm4a';
	if (/mpeg/i.test(mime)) return 'mp3';
	if (/ogg/i.test(mime)) return 'ogg';
	return 'webm';
}

/* ------------------------------------------------------------------ */
/* rendering voice comments into card threads                          */
/* ------------------------------------------------------------------ */

function ensureSessionAudio(record) {
	if (record.url || record.blob) return record.url || URL.createObjectURL(record.blob);
	if (record.dataUrl) {
		try {
			const blob = dataUrlToBlob(record.dataUrl, record.mime);
			record.blob = blob;
			record.url = URL.createObjectURL(blob);
			return record.url;
		} catch (_) { return null; }
	}
	return null;
}

function dataUrlToBlob(dataUrl, mime) {
	const [head, b64] = dataUrl.split(',');
	const type = /data:([^;]+)/.exec(head)?.[1] || mime || 'audio/webm';
	const bin = atob(b64);
	const bytes = new Uint8Array(bin.length);
	for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
	return new Blob([bytes], { type });
}

let currentlyPlaying = null;

/** A single voice comment row: play button, waveform, duration, author. */
export function renderVoiceRow(record) {
	const el = document.createElement('article');
	el.className = 'vc-row';
	el.innerHTML =
		'<div class="vc-row-head">' +
			`<span class="vc-row-avatar" aria-hidden="true">${escapeHtml(initialsOf(record.author))}</span>` +
			`<span class="vc-row-author">${escapeHtml(record.author || 'A reader')}</span>` +
			`<span class="vc-row-badge">${svgMic()}<span>Voice</span></span>` +
		'</div>' +
		'<div class="vc-player">' +
			'<button type="button" class="vc-play" aria-label="Play voice comment">' + svgPlay() + '</button>' +
			'<canvas class="vc-wave" aria-hidden="true"></canvas>' +
			`<span class="vc-duration">${formatClock(record.durationSec || 0)}</span>` +
		'</div>';
	const bars = barsFromPeaks(record.peaks);
	const canvas = el.querySelector('.vc-wave');
	const playBtn = el.querySelector('.vc-play');
	paintWaveform(canvas, bars, 0);
	let audio = null, playing = false;

	function setPlaying(next) {
		playing = next;
		playBtn.innerHTML = next ? svgPause() : svgPlay();
		playBtn.setAttribute('aria-label', next ? 'Pause voice comment' : 'Play voice comment');
		el.classList.toggle('is-playing', next);
	}

	playBtn.addEventListener('click', () => {
		if (playing && audio) { audio.pause(); return; }
		if (currentlyPlaying && currentlyPlaying !== setPlaying) currentlyPlaying(false);
		const src = ensureSessionAudio(record);
		if (!src) {
			playBtn.disabled = true;
			playBtn.title = 'Audio is no longer available on this device.';
			return;
		}
		if (!audio) {
			audio = new Audio(src);
			audio.playsInline = true;
			audio.preload = 'auto';
			audio.addEventListener('timeupdate', () => {
				paintWaveform(canvas, bars, audio.duration ? audio.currentTime / audio.duration : 0);
			});
			audio.addEventListener('ended', () => { setPlaying(false); paintWaveform(canvas, bars, 0); currentlyPlaying = null; });
			audio.addEventListener('pause', () => { setPlaying(false); });
		}
		currentlyPlaying = setPlaying;
		audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
	});

	const repaint = () => paintWaveform(canvas, bars, audio && audio.duration ? audio.currentTime / audio.duration : 0);
	window.addEventListener('resize', repaint);
	return el;
}

function initialsOf(name) {
	const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
	if (!parts.length) return '•';
	return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
}

/** Re-renders the voice-comment section for the card with this postId. */
export function renderVoiceListForCard(postId) {
	const card = document.querySelector(`.feed-card[data-post-id="${CSS.escape(String(postId))}"]`);
	if (!card) return;
	const list = card.querySelector('.feed-comment-list');
	if (!list) return;
	const records = loadVoiceComments(postId);
	card.querySelector('.vc-list')?.remove();
	if (!records.length) return;
	const wrap = document.createElement('div');
	wrap.className = 'vc-list';
	wrap.setAttribute('aria-label', 'Voice comments');
	const head = document.createElement('p');
	head.className = 'vc-list-head';
	head.textContent = records.length === 1 ? '1 voice comment' : `${records.length} voice comments`;
	wrap.append(head);
	for (const r of records) wrap.append(renderVoiceRow(r));
	list.before(wrap);
	const empty = card.querySelector('.feed-comments-empty');
	if (empty) empty.hidden = true;
}

/* ------------------------------------------------------------------ */
/* wiring into existing comment composers                               */
/* ------------------------------------------------------------------ */

function injectMicButton(form) {
	if (form.querySelector('.vc-mic-btn')) return;
	const row = form.querySelector('.feed-comment-row');
	const send = form.querySelector('.feed-comment-send');
	if (!row || !send) return;
	const btn = document.createElement('button');
	btn.type = 'button';
	btn.className = 'vc-mic-btn';
	btn.setAttribute('aria-label', 'Record a voice comment');
	btn.title = 'Record a voice comment (up to 2 minutes)';
	btn.innerHTML = svgMic();
	btn.addEventListener('click', () => {
		const card = form.closest('.feed-card');
		const postId = card?.dataset?.postId || 'unknown-post';
		openVoiceComposer({
			postId,
			onPosted: () => {
				// Voice rows render from localStorage; nothing else to do.
			}
		});
	});
	row.insertBefore(btn, send);
}

function scanForms(root) {
	root.querySelectorAll?.('.feed-comment-form').forEach(injectMicButton);
	if (root.classList?.contains('feed-comment-form')) injectMicButton(root);
}

/** Call once on page boot. Also re-renders stored voice rows per card. */
export function initVoiceComments() {
	scanForms(document);
	const obs = new MutationObserver((mutations) => {
		for (const m of mutations) {
			for (const node of m.addedNodes) {
				if (node.nodeType !== 1) continue;
				scanForms(node);
				if (node.classList?.contains('feed-card') && node.dataset?.postId) {
					renderVoiceListForCard(node.dataset.postId);
				}
			}
		}
	});
	obs.observe(document.body, { childList: true, subtree: true });
	document.querySelectorAll('.feed-card[data-post-id]').forEach(card => {
		renderVoiceListForCard(card.dataset.postId);
	});
}
