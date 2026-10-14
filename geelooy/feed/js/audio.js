// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module FeedAudio
 * @description
 * Yaakov 2026-10-14: text-to-speech for every feed post (TRACK A). A Listen
 * button joins each card's action bar; it opens a small control panel with
 * play/pause, stop, speed, and voice selection. The post is read paragraph
 * by paragraph and the paragraph being read is highlighted. Hebrew and
 * English are both first-class: voices are matched per paragraph language,
 * and the voice picker lists Hebrew voices first.
 *
 * Built on the Web Speech API (speechSynthesis). Attaches through the
 * `feed:card-mounted` extension point, so cards.js is never edited for this.
 * Only one card reads at a time; starting another stops the first.
 */

import { icon, escapeHtml, escapeAttr } from './icons.js';

export const AUDIO_PREFS_KEY = 'awtsmoos-audio-prefs-v1';

const SPEAKER_SVG = () => icon('speaker', 'feed-audio-ic');
const PLAY_SVG = () => icon('play', 'feed-audio-ic');
const PAUSE_SVG = () => icon('pause', 'feed-audio-ic');
const STOP_SVG = () => icon('stop', 'feed-audio-ic');

const RATES = [0.75, 1, 1.25, 1.5];
const CHUNK_MAX = 220; // characters per utterance — keeps Chrome's long-utterance stall away
const HEBREW_RE = /[\u0590-\u05FF]/;

const synth = (() => {
	try {
		return ('speechSynthesis' in window) ? window.speechSynthesis : null;
	} catch (_) { return null; }
})();

let voicesCache = null;
let voicesPromise = null;

function readPrefs() {
	try {
		const raw = localStorage.getItem(AUDIO_PREFS_KEY);
		const p = raw ? JSON.parse(raw) : null;
		return p && typeof p === 'object' ? p : {};
	} catch (_) { return {}; }
}

function writePrefs(patch) {
	try {
		localStorage.setItem(AUDIO_PREFS_KEY, JSON.stringify({ ...readPrefs(), ...patch }));
	} catch (_) { /* private mode */ }
}

/** Resolves the voice list (voiceschanged fires async on first load). */
function ensureVoices() {
	if (voicesCache) return Promise.resolve(voicesCache);
	if (voicesPromise) return voicesPromise;
	voicesPromise = new Promise((resolve) => {
		const grab = () => {
			try {
				const list = synth.getVoices();
				if (list && list.length) {
					voicesCache = [...list].sort(voiceRank);
					resolve(voicesCache);
					return true;
				}
			} catch (_) { /* fall through */ }
			return false;
		};
		if (grab()) return;
		let tries = 0;
		const onChange = () => { if (grab()) synth.removeEventListener('voiceschanged', onChange); };
		try { synth.addEventListener('voiceschanged', onChange); } catch (_) {}
		const poll = setInterval(() => {
			tries++;
			if (grab() || tries > 20) {
				clearInterval(poll);
				try { synth.removeEventListener('voiceschanged', onChange); } catch (_) {}
				resolve(voicesCache || []);
			}
		}, 250);
	});
	return voicesPromise;
}

/** Hebrew voices first, then English, then the rest — alphabetical. */
function voiceRank(a, b) {
	const lang = (v) => String(v.lang || '').toLowerCase();
	const rankOf = (v) => {
		const l = lang(v);
		if (l.startsWith('he')) return 0;
		if (l.startsWith('en')) return 1;
		return 2;
	};
	const r = rankOf(a) - rankOf(b);
	if (r !== 0) return r;
	return String(a.name || '').localeCompare(String(b.name || ''));
}

function pickVoice(lang, voices, preferredName) {
	if (preferredName) {
		const named = voices.find(v => v.name === preferredName);
		if (named) return named;
	}
	const wantHe = lang === 'he';
	const pool = voices.filter(v => {
		const l = String(v.lang || '').toLowerCase();
		return wantHe ? l.startsWith('he') : l.startsWith('en');
	});
	if (pool.length) {
		const local = pool.find(v => v.localService);
		return local || pool[0];
	}
	return voices[0] || null;
}

function detectLang(text) {
	return HEBREW_RE.test(text) ? 'he' : 'en';
}

/** Splits long text into sentence-ish chunks the synthesizer handles well. */
function chunkText(text, max = CHUNK_MAX) {
	const clean = String(text || '').replace(/\s+/g, ' ').trim();
	if (!clean) return [];
	if (clean.length <= max) return [clean];
	const sentences = clean.match(/[^.!?׃]+[.!?׃]?/g) || [clean];
	const chunks = [];
	let buf = '';
	for (const s of sentences) {
		const piece = s.trim();
		if (!piece) continue;
		if ((buf + ' ' + piece).trim().length > max && buf) {
			chunks.push(buf.trim());
			buf = piece;
		} else {
			buf = (buf + ' ' + piece).trim();
		}
	}
	if (buf.trim()) chunks.push(buf.trim());
	return chunks.length ? chunks : [clean.slice(0, max)];
}

/**
 * Collects readable segments from a card, in reading order.
 * @returns {Array<{el: Element, text: string, lang: string}>}
 */
function collectSegments(card) {
	const segs = [];
	const push = (el) => {
		if (!el) return;
		const text = el.textContent.replace(/\s+/g, ' ').trim();
		if (!text) return;
		const lang = detectLang(text);
		for (const chunk of chunkText(text)) {
			segs.push({ el, text: chunk, lang });
		}
	};
	push(card.querySelector('.feed-card-title'));
	push(card.querySelector('.feed-card-hetitle'));
	push(card.querySelector('.feed-card-excerpt'));
	// Expanded inline-reader content reads too, when the reader is open.
	const reader = card.querySelector('.feed-reader-inner');
	if (reader && !reader.closest('.feed-reader')?.hidden) {
		reader.querySelectorAll('p, li, h4, h5, blockquote').forEach(push);
		if (!segs.some(s => reader.contains(s.el))) push(reader);
	}
	return segs;
}

/* ============ one global reader ============ */

let active = null; // { card, btn, panel, playBtn, segs, idx, state, watchdog }

function setBtnState(entry, state, label) {
	entry.state = state;
	const ic = entry.btn.querySelector('.feed-audio-ic, .feed-ic');
	if (ic) ic.outerHTML = (state === 'playing' ? PAUSE_SVG() : state === 'paused' ? PLAY_SVG() : SPEAKER_SVG());
	const playIc = entry.playBtn?.querySelector('.feed-ic');
	if (playIc && entry.playBtn) {
		playIc.outerHTML = (state === 'playing' ? PAUSE_SVG() : PLAY_SVG());
	}
	entry.btn.classList.toggle('is-playing', state === 'playing');
	entry.btn.classList.toggle('is-paused', state === 'paused');
	if (label) {
		entry.btn.setAttribute('aria-label', label);
		const text = entry.btn.querySelector('.feed-ic-btn-label');
		if (text) text.textContent = label.replace('Listen to this post', 'Listen')
			.replace('Pause reading', 'Pause').replace('Resume reading', 'Resume');
	}
}

function clearHighlight(entry) {
	entry.segs.forEach(s => s.el.classList?.remove('feed-audio-reading'));
}

function stopActive(silent) {
	if (!active) return;
	const entry = active;
	active = null;
	clearInterval(entry.watchdog);
	try { synth.cancel(); } catch (_) {}
	clearHighlight(entry);
	setBtnState(entry, 'idle', 'Listen to this post');
	if (!silent) hidePanel(entry);
}

function hidePanel(entry) {
	if (entry?.panel) entry.panel.hidden = true;
	entry?.btn?.setAttribute('aria-expanded', 'false');
}

function speakChunk(entry) {
	const seg = entry.segs[entry.idx];
	if (!seg) { stopActive(); return; }
	clearHighlight(entry);
	try { seg.el.classList.add('feed-audio-reading'); } catch (_) {}
	try {
		seg.el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
	} catch (_) {}
	const voices = voicesCache || [];
	const voice = pickVoice(seg.lang, voices, entry.preferredVoice);
	let utter;
	try {
		utter = new SpeechSynthesisUtterance(seg.text);
	} catch (_) {
		entry.idx++;
		speakChunk(entry);
		return;
	}
	utter.lang = seg.lang === 'he' ? 'he-IL' : 'en-US';
	if (voice) utter.voice = voice;
	utter.rate = entry.rate;
	utter.onstart = () => { entry.lastActivity = Date.now(); };
	utter.onend = () => {
		if (active !== entry) return;
		entry.lastActivity = Date.now();
		entry.idx++;
		speakChunk(entry);
	};
	utter.onerror = (ev) => {
		if (active !== entry) return;
		// "interrupted" is our own cancel() — anything else advances one chunk.
		if (ev && ev.error && ev.error !== 'interrupted' && ev.error !== 'canceled') {
			entry.idx++;
			speakChunk(entry);
		} else if (!ev || !ev.error) {
			entry.idx++;
			speakChunk(entry);
		}
	};
	entry.lastActivity = Date.now();
	try {
		synth.speak(utter);
	} catch (_) {
		stopActive();
	}
}

function startReading(entry) {
	if (!synth) return;
	stopActive(true);
	const segs = collectSegments(entry.card);
	if (!segs.length) return;
	entry.segs = segs;
	entry.idx = 0;
	entry.lastActivity = Date.now();
	active = entry;
	setBtnState(entry, 'playing', 'Pause reading');
	/* Watchdog: some platforms stall mid-utterance without onend. If the
	   synthesizer goes quiet for 6s mid-read, re-speak the current chunk. */
	entry.watchdog = setInterval(() => {
		if (active !== entry || entry.state !== 'playing') return;
		let speaking = false;
		try { speaking = synth.speaking; } catch (_) {}
		if (!speaking && Date.now() - entry.lastActivity > 6000 && entry.idx < entry.segs.length) {
			speakChunk(entry);
		}
	}, 2000);
	speakChunk(entry);
}

function pauseReading(entry) {
	if (active !== entry) return;
	try { synth.pause(); } catch (_) {}
	setBtnState(entry, 'paused', 'Resume reading');
}

function resumeReading(entry) {
	if (active !== entry) return;
	try { synth.resume(); } catch (_) {}
	entry.lastActivity = Date.now();
	setBtnState(entry, 'playing', 'Pause reading');
}

/* ============ per-card UI ============ */

function buildPanel(entry) {
	const panel = document.createElement('div');
	panel.className = 'feed-audio-panel';
	panel.hidden = true;
	panel.setAttribute('role', 'group');
	panel.setAttribute('aria-label', 'Reading controls');
	panel.innerHTML =
		'<div class="feed-audio-row">' +
			'<button type="button" class="feed-ic-btn feed-audio-play" aria-label="Play from the beginning">' +
				PLAY_SVG() + '<span class="feed-ic-btn-label">Play</span></button>' +
			'<button type="button" class="feed-ic-btn feed-audio-stop" aria-label="Stop reading">' +
				STOP_SVG() + '<span class="feed-ic-btn-label">Stop</span></button>' +
			'<label class="feed-audio-rate">Speed' +
				`<select class="feed-audio-rate-select" aria-label="Reading speed">` +
				RATES.map(r => `<option value="${r}"${r === entry.rate ? ' selected' : ''}>${r}×</option>`).join('') +
				'</select></label>' +
		'</div>' +
		'<label class="feed-audio-voice">Voice' +
			'<select class="feed-audio-voice-select" aria-label="Reading voice"><option value="">Loading voices…</option></select>' +
		'</label>';
	entry.playBtn = panel.querySelector('.feed-audio-play');

	entry.playBtn.addEventListener('click', (ev) => {
		ev.stopPropagation();
		if (active === entry && entry.state === 'playing') pauseReading(entry);
		else if (active === entry && entry.state === 'paused') resumeReading(entry);
		else startReading(entry);
	});
	panel.querySelector('.feed-audio-stop')?.addEventListener('click', (ev) => {
		ev.stopPropagation();
		stopActive();
	});
	panel.querySelector('.feed-audio-rate-select')?.addEventListener('change', (ev) => {
		const r = parseFloat(ev.target.value);
		if (RATES.includes(r)) {
			entry.rate = r;
			writePrefs({ rate: r });
			// Restart the current chunk at the new speed when reading.
			if (active === entry && entry.state !== 'idle') {
				try { synth.cancel(); } catch (_) {}
				setTimeout(() => { if (active === entry) speakChunk(entry); }, 60);
			}
		}
	});
	const voiceSelect = panel.querySelector('.feed-audio-voice-select');
	voiceSelect?.addEventListener('change', (ev) => {
		entry.preferredVoice = ev.target.value || '';
		writePrefs({ voice: entry.preferredVoice });
	});
	ensureVoices().then((voices) => {
		if (!document.body.contains(voiceSelect)) return;
		const opts = voices.map(v => {
			const lang = String(v.lang || '');
			const tag = lang ? ` — ${lang}` : '';
			return `<option value="${escapeAttr(v.name)}"${v.name === entry.preferredVoice ? ' selected' : ''}>${escapeHtml(v.name)}${escapeHtml(tag)}</option>`;
		});
		voiceSelect.innerHTML = '<option value="">Auto (best match per language)</option>' + opts.join('');
	});
	return panel;
}

/**
 * Attaches the Listen button + panel to one rendered card.
 * @param {HTMLElement} card The .feed-card element.
 */
export function attachAudioControls(card) {
	if (!card || !synth || card.querySelector('.feed-audio')) return;
	const actions = card.querySelector('.feed-card-actions');
	if (!actions) return;
	const prefs = readPrefs();
	const entry = {
		card,
		btn: null,
		panel: null,
		playBtn: null,
		segs: [],
		idx: 0,
		state: 'idle',
		rate: RATES.includes(Number(prefs.rate)) ? Number(prefs.rate) : 1,
		preferredVoice: String(prefs.voice || ''),
		watchdog: null,
		lastActivity: 0
	};
	const wrap = document.createElement('span');
	wrap.className = 'feed-audio';
	const btn = document.createElement('button');
	btn.type = 'button';
	btn.className = 'feed-ic-btn feed-audio-btn';
	btn.setAttribute('aria-label', 'Listen to this post');
	btn.setAttribute('aria-expanded', 'false');
	btn.innerHTML = `${SPEAKER_SVG()}<span class="feed-ic-btn-label">Listen</span>`;
	const panel = buildPanel(entry);
	entry.btn = btn;
	entry.panel = panel;
	wrap.append(btn, panel);

	btn.addEventListener('click', (ev) => {
		ev.stopPropagation();
		if (panel.hidden) {
			// Opening the panel on another card stops the current reader.
			if (active && active !== entry) stopActive();
			panel.hidden = false;
			btn.setAttribute('aria-expanded', 'true');
			if (entry.state === 'idle') startReading(entry);
		} else {
			// The button doubles as play/pause once the panel is open.
			if (active === entry && entry.state === 'playing') pauseReading(entry);
			else if (active === entry && entry.state === 'paused') resumeReading(entry);
			else if (entry.state === 'idle') startReading(entry);
		}
	});

	// Clicks inside the panel must not close it or bubble to card handlers.
	panel.addEventListener('click', (ev) => ev.stopPropagation());

	const spacer = actions.querySelector('.feed-card-actions-spacer');
	if (spacer) actions.insertBefore(wrap, spacer);
	else actions.append(wrap);
}

/* ============ init ============ */

/** Wires audio into the feed: present and future cards. */
export function initAudio() {
	if (!synth) return; // no Web Speech API — the river simply has no Listen buttons
	document.addEventListener('feed:card-mounted', (ev) => {
		const card = ev.detail?.card;
		if (card) attachAudioControls(card);
	});
	// Cards already in the DOM (if init ran after a render).
	document.querySelectorAll('.feed-card').forEach(attachAudioControls);
	// Escape closes any open audio panel.
	document.addEventListener('keydown', (ev) => {
		if (ev.key !== 'Escape') return;
		document.querySelectorAll('.feed-audio-panel:not([hidden])').forEach(p => {
			p.hidden = true;
			p.closest('.feed-audio')?.querySelector('.feed-audio-btn')?.setAttribute('aria-expanded', 'false');
		});
	});
}
