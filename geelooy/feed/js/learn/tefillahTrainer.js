// B"H
/**
 * @module TefillahTrainer
 * @description
 * B"H — Yaakov 2026-10-14 (TRACK I): the Tefillah Trainer. Learn prayers
 * line by line: Hebrew text, transliteration, and translation side by side,
 * audio playback per line via the Web Speech API (Hebrew voice when the
 * device has one), and progress tracking — mark lines and whole prayers
 * as learned. Progress persists in localStorage.
 *
 * CONTENT RULE (standing): SCAFFOLD ONLY. Prayer names are public facts;
 * every line's Hebrew, transliteration, and translation is an EDITOR slot.
 * This module never invents or auto-generates prayer text or translations.
 *
 * Mounts via `mount(el, ctx)`; `initCardHooks()` is a no-op.
 */

import { icon, escapeHtml } from '../icons.js';

const STORE_KEY = 'awtsmoos-tefillah-progress-v1';

/* B"H — EDITORS: add prayers here. Each line is filled by a human editor:
   { hebrew: '..', transliteration: '..', translation: '..' }.
   Leave a prayer with lines: [] and it renders editor slots. */
const PRAYERS = [
	{ key: 'modeh-ani', name: 'Modeh Ani', hebrew: 'מודה אני', lines: [] },
	{ key: 'shema', name: 'Shema', hebrew: 'שמע', lines: [] },
	{ key: 'shemoneh-esrei', name: 'Shemoneh Esrei', hebrew: 'שמונה עשרה', lines: [] },
	{ key: 'birkat-hamazon', name: 'Birkas Hamazon', hebrew: 'ברכת המזון', lines: [] },
	{ key: 'kiddush', name: 'Kiddush', hebrew: 'קידוש', lines: [] },
	{ key: 'havdalah', name: 'Havdalah', hebrew: 'הבדלה', lines: [] },
	{ key: 'asher-yatzar', name: 'Asher Yatzar', hebrew: 'אשר יצר', lines: [] },
	{ key: 'adon-olam', name: 'Adon Olam', hebrew: 'אדון עולם', lines: [] },
];

function speak(text, lang) {
	if (!('speechSynthesis' in window)) return false;
	try {
		window.speechSynthesis.cancel();
		const u = new SpeechSynthesisUtterance(text);
		u.lang = lang || 'he-IL';
		u.rate = Number(localStorage.getItem('awtsmoos-tefillah-rate') || '0.85');
		const voices = window.speechSynthesis.getVoices();
		const he = voices.find(v => (v.lang || '').toLowerCase().startsWith('he'));
		if (he) u.voice = he;
		window.speechSynthesis.speak(u);
		return true;
	} catch (_) { return false; }
}

function editorSlot(label, hint) {
	return `
		<div class="lti-slot">
			<span class="lti-slot-label">${escapeHtml(label)}</span>
			<p>${escapeHtml(hint)}</p>
		</div>`;
}

export async function mount(el, ctx) {
	el.classList.add('lti');
	const progress = ctx.readStore(STORE_KEY, { prayers: {}, lines: {} });
	const save = () => ctx.writeStore(STORE_KEY, progress);
	const isPrayerLearned = (key) => progress.prayers[key] === true;
	const isLineLearned = (pkey, i) => Array.isArray(progress.lines[pkey]) && progress.lines[pkey].includes(i);

	function renderIndex() {
		const total = PRAYERS.length;
		const done = PRAYERS.filter(p => isPrayerLearned(p.key)).length;
		el.innerHTML = `
			<div class="lti-head">
				<div>
					<h3>${icon('speaker', 'feed-ic')} Tefillah Trainer</h3>
					<p>Learn prayers line by line — hear each line, read along, mark your progress.</p>
				</div>
			</div>
			<div class="lti-card">
				<h4>Your progress</h4>
				<div class="lti-progress" role="progressbar" aria-valuenow="${done}" aria-valuemin="0" aria-valuemax="${total}"
					aria-label="Prayers learned"><span style="width:${total ? Math.round((done / total) * 100) : 0}%"></span></div>
				<p class="lti-stat">${done} of ${total} prayers learned</p>
				<div class="lti-row">
					<label class="lti-stat" for="lti-speech-rate">Audio speed</label>
					<input type="range" id="lti-speech-rate" class="lti-input" min="0.5" max="1.2" step="0.05"
						value="${escapeHtml(localStorage.getItem('awtsmoos-tefillah-rate') || '0.85')}" style="max-width:160px">
					<button type="button" class="lti-btn" data-stop-audio>${icon('stop')} Stop audio</button>
				</div>
				${('speechSynthesis' in window) ? '' : '<p class="lti-stat">Audio playback is not available in this browser.</p>'}
			</div>
			<div class="lti-grid">
				${PRAYERS.map(p => {
					const learnedCount = p.lines.filter((_, i) => isLineLearned(p.key, i)).length;
					return `
					<button type="button" class="lti-tile ${isPrayerLearned(p.key) ? 'is-now' : ''}" data-prayer="${escapeHtml(p.key)}">
						<span class="lti-tile-he">${escapeHtml(p.hebrew)}</span>
						<span class="lti-tile-title">${escapeHtml(p.name)}</span>
						<span class="lti-tile-sub">${p.lines.length ? `${learnedCount}/${p.lines.length} lines learned` : 'Content — editors preparing'}</span>
						${isPrayerLearned(p.key) ? '<span class="lti-now-badge">Learned</span>' : ''}
					</button>`;
				}).join('')}
			</div>`;
		el.querySelector('#lti-speech-rate').addEventListener('input', (e) => {
			try { localStorage.setItem('awtsmoos-tefillah-rate', e.target.value); } catch (_) {}
		});
		el.querySelector('[data-stop-audio]').addEventListener('click', () => {
			try { window.speechSynthesis.cancel(); } catch (_) {}
		});
		el.querySelectorAll('[data-prayer]').forEach(btn => {
			btn.addEventListener('click', () => {
				const p = PRAYERS.find(x => x.key === btn.dataset.prayer);
				if (p) renderPrayer(p);
			});
		});
	}

	function renderPrayer(p) {
		el.innerHTML = `
			<div class="lti-head">
				<div>
					<h3><span class="lti-he" style="font-size:22px">${escapeHtml(p.hebrew)}</span> ${escapeHtml(p.name)}</h3>
					<p>Listen to each line, read along in three columns, check off what you know.</p>
				</div>
				<button type="button" class="lti-back" data-prayer-back>${icon('chevronUp')} All prayers</button>
			</div>
			<div class="lti-card">
				<div class="lti-row">
					<button type="button" class="lti-btn primary" data-play-all ${p.lines.length ? '' : 'disabled'}>${icon('play')} Play all lines</button>
					<button type="button" class="lti-btn" data-stop-audio>${icon('stop')} Stop</button>
					<button type="button" class="lti-check" data-prayer-learned aria-pressed="${isPrayerLearned(p.key)}">
						${icon('check')} ${isPrayerLearned(p.key) ? 'Learned' : 'Mark prayer learned'}
					</button>
				</div>
			</div>
			<div id="lti-lines">
				${p.lines.length ? p.lines.map((line, i) => lineCard(p, line, i)).join('') : editorSlot(
					'Prayer lines',
					`Editor: add the lines of ${p.name} here — each line with Hebrew text, transliteration, and translation, written or reviewed by a human.`)}
			</div>`;
		el.querySelector('[data-prayer-back]').addEventListener('click', () => {
			try { window.speechSynthesis.cancel(); } catch (_) {}
			renderIndex();
		});
		el.querySelector('[data-stop-audio]').addEventListener('click', () => {
			try { window.speechSynthesis.cancel(); } catch (_) {}
		});
		el.querySelector('[data-prayer-learned]').addEventListener('click', (e) => {
			const btn = e.currentTarget;
			progress.prayers[p.key] = !isPrayerLearned(p.key);
			save();
			btn.setAttribute('aria-pressed', String(isPrayerLearned(p.key)));
			btn.innerHTML = `${icon('check')} ${isPrayerLearned(p.key) ? 'Learned' : 'Mark prayer learned'}`;
		});
		el.querySelector('[data-play-all]').addEventListener('click', () => {
			if (!('speechSynthesis' in window)) return;
			try {
				window.speechSynthesis.cancel();
				p.lines.forEach((line, i) => {
					const u = new SpeechSynthesisUtterance(line.hebrew || '');
					u.lang = 'he-IL';
					u.rate = Number(localStorage.getItem('awtsmoos-tefillah-rate') || '0.85');
					const voices = window.speechSynthesis.getVoices();
					const he = voices.find(v => (v.lang || '').toLowerCase().startsWith('he'));
					if (he) u.voice = he;
					window.speechSynthesis.speak(u);
				});
			} catch (_) {}
		});
		wireLines(p);
	}

	function lineCard(p, line, i) {
		const learned = isLineLearned(p.key, i);
		return `
			<div class="lti-line ${learned ? 'is-learned' : ''}" data-line="${i}">
				<div class="lti-line-head">
					<span class="lti-line-num">Line ${i + 1}</span>
					<button type="button" class="lti-btn" data-say="${i}" ${line.hebrew ? '' : 'disabled'}>${icon('speaker')} Hear it</button>
					<button type="button" class="lti-check" data-line-learned="${i}" aria-pressed="${learned}">
						${icon('check')} ${learned ? 'Learned' : 'Mark learned'}
					</button>
				</div>
				<div class="lti-line-body">
					<div class="lti-line-col">
						<span class="lti-col-label">Hebrew</span>
						<div class="lti-col-text lti-he" lang="he" dir="rtl">${escapeHtml(line.hebrew || '—')}</div>
					</div>
					<div class="lti-line-col">
						<span class="lti-col-label">Transliteration</span>
						<div class="lti-col-text">${escapeHtml(line.transliteration || '—')}</div>
					</div>
					<div class="lti-line-col">
						<span class="lti-col-label">Translation</span>
						<div class="lti-col-text">${escapeHtml(line.translation || '—')}</div>
					</div>
				</div>
			</div>`;
	}

	function wireLines(p) {
		el.querySelectorAll('[data-say]').forEach(btn => {
			btn.addEventListener('click', () => {
				const line = p.lines[Number(btn.dataset.say)];
				if (line && line.hebrew && !speak(line.hebrew, 'he-IL')) {
					btn.insertAdjacentHTML('afterend', '<span class="lti-stat">Audio unavailable here.</span>');
				}
			});
		});
		el.querySelectorAll('[data-line-learned]').forEach(btn => {
			btn.addEventListener('click', () => {
				const i = Number(btn.dataset.lineLearned);
				const arr = Array.isArray(progress.lines[p.key]) ? progress.lines[p.key] : [];
				const at = arr.indexOf(i);
				if (at >= 0) arr.splice(at, 1); else arr.push(i);
				progress.lines[p.key] = arr;
				save();
				const learned = at < 0;
				btn.setAttribute('aria-pressed', String(learned));
				btn.innerHTML = `${icon('check')} ${learned ? 'Learned' : 'Mark learned'}`;
				btn.closest('.lti-line').classList.toggle('is-learned', learned);
			});
		});
	}

	/* Warm the voice list so the Hebrew voice is ready on first tap. */
	try { if ('speechSynthesis' in window) window.speechSynthesis.getVoices(); } catch (_) {}

	renderIndex();
}

export function initCardHooks() {
	/* No per-card hooks for the trainer. */
}
