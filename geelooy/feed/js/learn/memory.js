// B"H
/**
 * @module MemorySystem
 * @description
 * B"H — Yaakov 2026-10-14 (TRACK I): the Memory System. Spaced-repetition
 * flashcards the user creates from passages they are learning. Simple
 * SM-2-ish scheduling over fixed intervals (1, 3, 7, 14, 30 days), a daily
 * review queue of due cards, and streak integration — finishing a review
 * session records the day in the shared learning-streak store.
 *
 * Storage: localStorage `awtsmoos-memory-cards-v1` (per alias).
 * Card: { id, front, back, deck, level, nextDue, createdAt, reviews }.
 * Grading: Again (back to 1 day), Hard (stay), Good (advance), Easy (jump).
 *
 * Mounts via `mount(el, ctx)`; `initCardHooks()` is a no-op.
 */

import { icon, escapeHtml } from '../icons.js';

const STORE_KEY = 'awtsmoos-memory-cards-v1';
const STREAK_KEY = 'awtsmoos-learning-streak-v1';

/* B"H — review intervals in days: level 0→1d, 1→3d, 2→7d, 3→14d, 4+→30d. */
const INTERVALS = [1, 3, 7, 14, 30];
const MAX_LEVEL = INTERVALS.length - 1;

function dayKey(d) {
	const p = (n) => String(n).padStart(2, '0');
	return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function uid() {
	return `card-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`;
}

/** Record a learning day in the shared streak store (same shape as streaks.js). */
function recordStreakDay(alias) {
	try {
		const raw = localStorage.getItem(STREAK_KEY);
		const all = raw ? JSON.parse(raw) : {};
		const key = String(alias || 'anonymous');
		const s = all[key] && typeof all[key] === 'object' ? all[key] : {};
		const days = Array.isArray(s.days) ? s.days.filter(x => /^\d{4}-\d{2}-\d{2}$/.test(String(x))) : [];
		const today = dayKey(new Date());
		if (!days.includes(today)) {
			days.push(today);
			days.sort();
			all[key] = { days: days.slice(-365), lastSyncDay: String(s.lastSyncDay || ''), nudgeDay: String(s.nudgeDay || '') };
			localStorage.setItem(STREAK_KEY, JSON.stringify(all));
		}
		return true;
	} catch (_) { return false; }
}

export async function mount(el, ctx) {
	el.classList.add('lti');
	const alias = ctx.alias || 'anonymous';
	const cards = ctx.readStore(STORE_KEY, {});
	const mine = Array.isArray(cards[alias]) ? cards[alias] : [];
	const save = () => {
		cards[alias] = mine;
		ctx.writeStore(STORE_KEY, cards);
	};

	const dueToday = () => {
		const today = dayKey(new Date());
		return mine.filter(c => !c.nextDue || c.nextDue <= today);
	};

	function schedule(card, grade) {
		/* grade: 'again' | 'hard' | 'good' | 'easy' */
		if (grade === 'again') card.level = 0;
		else if (grade === 'good') card.level = Math.min(MAX_LEVEL, card.level + 1);
		else if (grade === 'easy') card.level = Math.min(MAX_LEVEL, card.level + 2);
		/* 'hard' keeps the level. */
		const days = INTERVALS[card.level];
		const d = new Date();
		d.setDate(d.getDate() + days);
		card.nextDue = dayKey(d);
		card.reviews = (card.reviews || 0) + 1;
		save();
	}

	function renderIndex() {
		const due = dueToday();
		const streakDays = (() => {
			try {
				const all = JSON.parse(localStorage.getItem(STREAK_KEY) || '{}');
				const s = all[String(alias)];
				return Array.isArray(s && s.days) ? s.days.length : 0;
			} catch (_) { return 0; }
		})();
		el.innerHTML = `
			<div class="lti-head">
				<div>
					<h3>${icon('star', 'feed-ic')} Memory System</h3>
					<p>Flashcards with spaced repetition — review a little each day and it sticks.</p>
				</div>
			</div>
			<div class="lti-card">
				<h4>Today's review</h4>
				<div class="lti-row">
					<span class="lti-stat"><strong style="color:var(--aw-text);font-size:18px">${due.length}</strong> cards due</span>
					<span class="lti-stat">·</span>
					<span class="lti-stat">${mine.length} cards total</span>
					<span class="lti-stat">·</span>
					<span class="lti-stat">${streakDays} learning days</span>
				</div>
				<div class="lti-row" style="margin-top:10px">
					<button type="button" class="lti-btn primary" data-start-review ${due.length ? '' : 'disabled'}>${icon('play')} Start review (${due.length})</button>
					<button type="button" class="lti-btn" data-new-card>${icon('plus')} New card</button>
					<button type="button" class="lti-btn" data-manage>${icon('sheet')} My cards</button>
				</div>
				${due.length ? '' : '<p class="lti-stat" style="margin-top:8px">All caught up. New cards you add will appear here tomorrow.</p>'}
			</div>
			<div class="lti-card">
				<h4>How it works</h4>
				<p>After you answer, grade yourself honestly: <strong style="color:var(--aw-text)">Again</strong> restarts the card at 1 day;
				<strong style="color:var(--aw-text)"> Good</strong> moves it to the next interval (1 → 3 → 7 → 14 → 30 days).
				<strong style="color:var(--aw-text)"> Easy</strong> skips ahead. Finishing a review marks the day on your learning streak.</p>
			</div>`;
		el.querySelector('[data-start-review]').addEventListener('click', () => startReview(due));
		el.querySelector('[data-new-card]').addEventListener('click', renderNewCard);
		el.querySelector('[data-manage]').addEventListener('click', renderManage);
	}

	function renderNewCard() {
		el.innerHTML = `
			<div class="lti-head">
				<div>
					<h3>New flashcard</h3>
					<p>Copy a passage you are learning — front is the prompt, back is what you want to remember.</p>
				</div>
				<button type="button" class="lti-back" data-back>${icon('chevronUp')} Back</button>
			</div>
			<div class="lti-card">
				<label class="lti-stat" for="lti-card-deck">Deck (optional — e.g. “Daf Yomi”, “Parsha”)</label>
				<input id="lti-card-deck" class="lti-input" style="width:100%;margin:6px 0 12px" placeholder="Deck name">
				<label class="lti-stat" for="lti-card-front">Front — the question or prompt</label>
				<textarea id="lti-card-front" class="lti-textarea" style="margin:6px 0 12px" placeholder="What do you want to be asked?"></textarea>
				<label class="lti-stat" for="lti-card-back">Back — the answer</label>
				<textarea id="lti-card-back" class="lti-textarea" style="margin:6px 0 12px" placeholder="What should you remember?"></textarea>
				<div class="lti-row">
					<button type="button" class="lti-btn primary" data-save-card>${icon('plus')} Add card</button>
				</div>
				<p class="lti-stat" data-card-msg aria-live="polite" style="margin-top:8px"></p>
			</div>`;
		el.querySelector('[data-back]').addEventListener('click', renderIndex);
		el.querySelector('[data-save-card]').addEventListener('click', () => {
			const front = el.querySelector('#lti-card-front').value.trim();
			const back = el.querySelector('#lti-card-back').value.trim();
			const deck = el.querySelector('#lti-card-deck').value.trim() || 'General';
			const msg = el.querySelector('[data-card-msg]');
			if (!front || !back) {
				msg.textContent = 'Both sides need a little text before the card can be saved.';
				return;
			}
			mine.push({ id: uid(), front, back, deck, level: 0, nextDue: dayKey(new Date()), createdAt: Date.now(), reviews: 0 });
			save();
			msg.textContent = 'Card added — it joins tomorrow\'s review queue.';
			el.querySelector('#lti-card-front').value = '';
			el.querySelector('#lti-card-back').value = '';
		});
	}

	function renderManage() {
		const decks = {};
		mine.forEach(c => { (decks[c.deck || 'General'] = decks[c.deck || 'General'] || []).push(c); });
		el.innerHTML = `
			<div class="lti-head">
				<div>
					<h3>My cards (${mine.length})</h3>
					<p>Review what you have built. Deleting a card is permanent.</p>
				</div>
				<button type="button" class="lti-back" data-back>${icon('chevronUp')} Back</button>
			</div>
			${mine.length ? Object.entries(decks).map(([deck, list]) => `
				<div class="lti-card">
					<h4>${escapeHtml(deck)} <span class="lti-stat">(${list.length})</span></h4>
					<ul class="lti-list">
						${list.map(c => `
							<li><div style="padding:10px 12px">
								<span class="lti-list-title">${escapeHtml(c.front.slice(0, 80))}${c.front.length > 80 ? '…' : ''}</span>
								<span class="lti-list-sub">level ${c.level} · next due ${escapeHtml(c.nextDue || 'today')} · ${c.reviews || 0} reviews</span>
								<div class="lti-row" style="margin-top:6px">
									<button type="button" class="lti-btn" data-del="${escapeHtml(c.id)}">Delete</button>
								</div>
							</div></li>`).join('')}
					</ul>
				</div>`).join('')
				: '<div class="lti-empty">No cards yet — create your first one above.</div>'}`;
		el.querySelector('[data-back]').addEventListener('click', renderIndex);
		el.querySelectorAll('[data-del]').forEach(btn => {
			btn.addEventListener('click', () => {
				const i = mine.findIndex(c => c.id === btn.dataset.del);
				if (i >= 0 && confirm('Delete this card? This cannot be undone.')) {
					mine.splice(i, 1);
					save();
					renderManage();
				}
			});
		});
	}

	function startReview(queue) {
		const list = [...queue].sort(() => Math.random() - 0.5);
		let idx = 0;
		let reviewed = 0;

		function show() {
			if (idx >= list.length) {
				if (reviewed > 0) recordStreakDay(alias);
				el.innerHTML = `
					<div class="lti-head"><div><h3>Review complete</h3></div></div>
					<div class="lti-card" style="text-align:center">
						<h4>You reviewed ${reviewed} card${reviewed === 1 ? '' : 's'}.</h4>
						<p>Today is marked on your learning streak. Come back tomorrow — the spaced repetition does the rest.</p>
						<div class="lti-row" style="justify-content:center">
							<button type="button" class="lti-btn primary" data-back>Done</button>
						</div>
					</div>`;
				el.querySelector('[data-back]').addEventListener('click', renderIndex);
				return;
			}
			const card = list[idx];
			el.innerHTML = `
				<div class="lti-head">
					<div>
						<h3>Review ${idx + 1} of ${list.length}</h3>
						<p class="lti-stat">${escapeHtml(card.deck || 'General')}</p>
					</div>
					<button type="button" class="lti-back" data-quit>End review</button>
				</div>
				<div class="lti-flash">
					<span class="lti-flash-side">Front</span>
					<div class="lti-flash-text">${escapeHtml(card.front)}</div>
					<button type="button" class="lti-btn" data-reveal style="margin-top:8px">Show answer</button>
				</div>
				<div class="lti-grade-row" data-grades hidden>
					<button type="button" class="lti-btn" data-grade="again">Again</button>
					<button type="button" class="lti-btn" data-grade="hard">Hard</button>
					<button type="button" class="lti-btn primary" data-grade="good">Good</button>
					<button type="button" class="lti-btn" data-grade="easy">Easy</button>
				</div>`;
			el.querySelector('[data-quit]').addEventListener('click', () => {
				if (reviewed > 0) recordStreakDay(alias);
				renderIndex();
			});
			el.querySelector('[data-reveal]').addEventListener('click', (e) => {
				e.currentTarget.remove();
				const flash = el.querySelector('.lti-flash');
				flash.insertAdjacentHTML('beforeend', `
					<span class="lti-flash-side">Back</span>
					<div class="lti-flash-text" style="color:var(--accent-gold)">${escapeHtml(card.back)}</div>`);
				el.querySelector('[data-grades]').hidden = false;
			});
			el.querySelectorAll('[data-grade]').forEach(btn => {
				btn.addEventListener('click', () => {
					schedule(card, btn.dataset.grade);
					reviewed += 1;
					idx += 1;
					show();
				});
			});
		}

		show();
	}

	renderIndex();
}

export function initCardHooks() {
	/* No per-card hooks for the memory system. */
}
