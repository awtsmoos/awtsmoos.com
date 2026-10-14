// B"H
/**
 * @module HebrewTutor
 * @description
 * B"H — Yaakov 2026-10-14 (TRACK I): the Hebrew Tutor. Aleph-beis learning:
 * the letters with their names, the vowels with plain sound hints, and
 * gentle multiple-choice quizzes (letter recognition both ways). Progress
 * persists in localStorage.
 *
 * Feedback is always encouraging and never shaming — a wrong answer gets a
 * warm "not quite, look again" and another chance, never a scolding.
 * Letter/vowel names and sound hints are basic literacy facts, not Torah
 * content, so they ship in the module (editors may refine wording).
 *
 * Mounts via `mount(el, ctx)`; `initCardHooks()` is a no-op.
 */

import { icon, escapeHtml } from '../icons.js';

const STORE_KEY = 'awtsmoos-hebrew-tutor-v1';

const LETTERS = [
	['א', 'Alef'], ['ב', 'Beis'], ['ג', 'Gimel'], ['ד', 'Daled'],
	['ה', 'Hei'], ['ו', 'Vav'], ['ז', 'Zayin'], ['ח', 'Ches'],
	['ט', 'Tes'], ['י', 'Yud'], ['כ', 'Chof'], ['ך', 'Chof sofit (final)'],
	['ל', 'Lamed'], ['מ', 'Mem'], ['ם', 'Mem sofit (final)'], ['נ', 'Nun'],
	['ן', 'Nun sofit (final)'], ['ס', 'Samech'], ['ע', 'Ayin'], ['פ', 'Pei'],
	['ף', 'Pei sofit (final)'], ['צ', 'Tzaddi'], ['ץ', 'Tzaddi sofit (final)'],
	['ק', 'Kuf'], ['ר', 'Reish'], ['ש', 'Shin'], ['ת', 'Tav'],
].map(([glyph, name]) => ({ glyph, name }));

const VOWELS = [
	{ glyph: 'אָ', name: 'Kamatz', hint: 'makes an "ah" sound, like "father"' },
	{ glyph: 'אַ', name: 'Patach', hint: 'makes an "ah" sound, like "cat"' },
	{ glyph: 'אֵ', name: 'Tzere', hint: 'makes an "ay" sound, like "day"' },
	{ glyph: 'אֶ', name: 'Segol', hint: 'makes an "eh" sound, like "bed"' },
	{ glyph: 'אִ', name: 'Chirik', hint: 'makes an "ee" sound, like "tree"' },
	{ glyph: 'אֹ', name: 'Cholam', hint: 'makes an "oh" sound, like "go"' },
	{ glyph: 'אֻ', name: 'Kubutz', hint: 'makes an "oo" sound, like "moon"' },
	{ glyph: 'אוּ', name: 'Shuruk', hint: 'makes an "oo" sound, like "moon"' },
	{ glyph: 'ְ', name: 'Sheva', hint: 'quick and quiet — like a tiny "uh", or silent at the end of a word' },
];

const ENCOURAGE_RIGHT = [
	'Beautiful — that\'s right!',
	'Yes! You\'ve got it.',
	'Wonderful work.',
	'Lovely — keep going.',
	'Exactly right. Proud of you.',
];

const ENCOURAGE_WRONG = [
	'Not quite — look again, you\'ll get it.',
	'Close! Take another look.',
	'Good try — the letters are tricky friends. One more look.',
	'Almost. Slow down and look carefully.',
];

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

export async function mount(el, ctx) {
	el.classList.add('lti');
	const progress = ctx.readStore(STORE_KEY, { seen: [], quizzesTaken: 0, bestStreak: 0 });
	const save = () => ctx.writeStore(STORE_KEY, progress);

	function markSeen(kind, name) {
		const key = `${kind}:${name}`;
		if (!progress.seen.includes(key)) {
			progress.seen.push(key);
			save();
		}
	}

	function renderIndex() {
		const seenLetters = progress.seen.filter(s => s.startsWith('letter:')).length;
		el.innerHTML = `
			<div class="lti-head">
				<div>
					<h3>${icon('spark', 'feed-ic')} Hebrew Tutor</h3>
					<p>Learn the aleph-beis at your own pace — letters, vowels, and gentle quizzes.</p>
				</div>
			</div>
			<div class="lti-card">
				<h4>Your journey</h4>
				<div class="lti-progress" role="progressbar" aria-valuenow="${seenLetters}" aria-valuemin="0" aria-valuemax="${LETTERS.length}"
					aria-label="Letters explored"><span style="width:${Math.round((seenLetters / LETTERS.length) * 100)}%"></span></div>
				<p class="lti-stat">${seenLetters} of ${LETTERS.length} letters explored · ${progress.quizzesTaken} quizzes taken · best streak ${progress.bestStreak}</p>
			</div>
			<div class="lti-grid">
				<button type="button" class="lti-tile" data-view="letters">
					<span class="lti-tile-he">א ב ג</span>
					<span class="lti-tile-title">Letters</span>
					<span class="lti-tile-sub">Meet each letter of the aleph-beis</span>
				</button>
				<button type="button" class="lti-tile" data-view="vowels">
					<span class="lti-tile-he">אָ אֵ אִ</span>
					<span class="lti-tile-title">Vowels</span>
					<span class="lti-tile-sub">The nekudos — how letters sing</span>
				</button>
				<button type="button" class="lti-tile" data-view="quiz-letter">
					<span class="lti-tile-title">Quiz: name the letter</span>
					<span class="lti-tile-sub">See a letter — pick its name</span>
				</button>
				<button type="button" class="lti-tile" data-view="quiz-glyph">
					<span class="lti-tile-title">Quiz: find the letter</span>
					<span class="lti-tile-sub">Hear a name — pick the letter</span>
				</button>
			</div>`;
		el.querySelectorAll('[data-view]').forEach(btn => {
			btn.addEventListener('click', () => {
				const v = btn.dataset.view;
				if (v === 'letters') renderLetters();
				else if (v === 'vowels') renderVowels();
				else startQuiz(v === 'quiz-glyph' ? 'glyph' : 'letter');
			});
		});
	}

	function renderLetters() {
		el.innerHTML = `
			<div class="lti-head">
				<div>
					<h3>The Aleph-Beis</h3>
					<p>Tap a letter to meet it. Hebrew reads right to left — start at the top right.</p>
				</div>
				<button type="button" class="lti-back" data-back>${icon('chevronUp')} Back</button>
			</div>
			<div class="lti-letter-grid" dir="rtl">
				${LETTERS.map(l => `
					<button type="button" class="lti-letter ${progress.seen.includes('letter:' + l.name) ? 'is-seen' : ''}"
						data-letter="${escapeHtml(l.name)}" aria-label="${escapeHtml(l.name)}">
						<span class="lti-glyph" lang="he">${escapeHtml(l.glyph)}</span>
						<span class="lti-glyph-name">${escapeHtml(l.name)}</span>
					</button>`).join('')}
			</div>
			<div class="lti-card" id="lti-letter-detail" style="margin-top:12px" hidden></div>`;
		el.querySelector('[data-back]').addEventListener('click', renderIndex);
		el.querySelectorAll('[data-letter]').forEach(btn => {
			btn.addEventListener('click', () => {
				const l = LETTERS.find(x => x.name === btn.dataset.letter);
				if (!l) return;
				markSeen('letter', l.name);
				btn.classList.add('is-seen');
				const d = el.querySelector('#lti-letter-detail');
				d.hidden = false;
				d.innerHTML = `
					<h4><span class="lti-he" style="font-size:28px">${escapeHtml(l.glyph)}</span> — ${escapeHtml(l.name)}</h4>
					<p>Say it out loud a few times: <strong style="color:var(--aw-text)">${escapeHtml(l.name)}</strong>.
					${l.name.includes('sofit') ? 'This is a final form — it only appears at the end of a word.' : 'Write it in the air with your finger.'}</p>`;
			});
		});
	}

	function renderVowels() {
		el.innerHTML = `
			<div class="lti-head">
				<div>
					<h3>The Vowels (Nekudos)</h3>
					<p>Little marks that tell the letters how to sound.</p>
				</div>
				<button type="button" class="lti-back" data-back>${icon('chevronUp')} Back</button>
			</div>
			<ul class="lti-list">
				${VOWELS.map(v => `
					<li><button type="button" class="lti-list-row" data-vowel="${escapeHtml(v.name)}">
						<span class="lti-glyph" lang="he" style="font-size:26px;flex:0 0 44px;text-align:center">${escapeHtml(v.glyph)}</span>
						<span class="lti-list-main">
							<span class="lti-list-title">${escapeHtml(v.name)}</span>
							<span class="lti-list-sub">${escapeHtml(v.hint)}</span>
						</span>
					</button></li>`).join('')}
			</ul>`;
		el.querySelector('[data-back]').addEventListener('click', renderIndex);
		el.querySelectorAll('[data-vowel]').forEach(btn => {
			btn.addEventListener('click', () => {
				markSeen('vowel', btn.dataset.vowel);
				btn.querySelector('.lti-list-title').insertAdjacentHTML('afterend',
					' <span class="lti-stat">· explored</span>');
			});
		});
	}

	function startQuiz(mode) {
		let streak = 0;
		let answered = 0;
		const total = 5;

		function question() {
			if (answered >= total) {
				progress.quizzesTaken += 1;
				progress.bestStreak = Math.max(progress.bestStreak, streak);
				save();
				el.innerHTML = `
					<div class="lti-head">
						<div><h3>Quiz complete</h3></div>
						<button type="button" class="lti-back" data-back>${icon('chevronUp')} Back</button>
					</div>
					<div class="lti-card" style="text-align:center">
						<h4>${streak === total ? 'A perfect round — wonderful!' : 'Well done for practicing!'}</h4>
						<p>You answered ${streak} of ${total} with your best streak in a row. Every try makes the letters more familiar.</p>
						<div class="lti-row" style="justify-content:center">
							<button type="button" class="lti-btn primary" data-again>${icon('spark')} Play again</button>
						</div>
					</div>`;
				el.querySelector('[data-back]').addEventListener('click', renderIndex);
				el.querySelector('[data-again]').addEventListener('click', () => startQuiz(mode));
				return;
			}
			const correct = pick(LETTERS);
			const distract = new Set([correct.name]);
			while (distract.size < 4) distract.add(pick(LETTERS).name);
			const options = [...distract].sort(() => Math.random() - 0.5);
			const prompt = mode === 'letter'
				? `What is the name of this letter?`
				: `Which letter is “${escapeHtml(correct.name)}”?`;
			el.innerHTML = `
				<div class="lti-head">
					<div>
						<h3>Quiz ${answered + 1} of ${total}</h3>
						<p class="lti-stat">Streak: ${streak} in a row</p>
					</div>
					<button type="button" class="lti-back" data-back>${icon('chevronUp')} Quit</button>
				</div>
				<div class="lti-card" style="text-align:center">
					<p style="font-size:15px;color:var(--aw-text)">${prompt}</p>
					${mode === 'letter'
						? `<div class="lti-glyph" lang="he" style="font-size:64px;margin:8px 0">${escapeHtml(correct.glyph)}</div>`
						: ''}
					<div class="lti-quiz-opts">
						${options.map(name => {
							const l = LETTERS.find(x => x.name === name);
							return `<button type="button" class="lti-btn" data-opt="${escapeHtml(name)}">${
								mode === 'letter' ? escapeHtml(name) : `<span class="lti-glyph" lang="he" style="font-size:26px">${escapeHtml(l.glyph)}</span>`
							}</button>`;
						}).join('')}
					</div>
					<p class="lti-encourage" data-encourage aria-live="polite"></p>
				</div>`;
			el.querySelector('[data-back]').addEventListener('click', renderIndex);
			const enc = el.querySelector('[data-encourage]');
			el.querySelectorAll('[data-opt]').forEach(btn => {
				btn.addEventListener('click', () => {
					if (btn.disabled) return;
					const right = btn.dataset.opt === correct.name;
					el.querySelectorAll('[data-opt]').forEach(b => {
						b.disabled = true;
						if (b.dataset.opt === correct.name) b.classList.add('is-correct');
					});
					if (right) {
						streak += 1;
						enc.textContent = pick(ENCOURAGE_RIGHT);
					} else {
						btn.classList.add('is-wrong');
						streak = 0;
						enc.textContent = pick(ENCOURAGE_WRONG);
					}
					answered += 1;
					setTimeout(question, right ? 900 : 1600);
				}, { once: true });
			});
		}

		question();
	}

	renderIndex();
}

export function initCardHooks() {
	/* No per-card hooks for the tutor. */
}
