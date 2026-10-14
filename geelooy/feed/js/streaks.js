// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module FeedStreaks
 * @description
 * Yaakov 2026-10-14: daily learning streaks for the Awtsmoos River. A streak
 * is a mirror, not a lever — it counts consecutive local days on which the
 * reader genuinely opened or read Torah content (a 50%-visible card view or
 * an expanded inline reader). It never shames, never nags: at most one
 * dismissible nudge per day, and only when an active streak is actually at
 * risk of lapsing.
 *
 * Storage: localStorage `awtsmoos-learning-streak-v1`, per alias, bounded to
 * 180 days. Server sync is best-effort: when signed in, a new learning day
 * is recorded to the owner-verified private activity ledger
 * (POST /unified-social/activity/:alias). The local record is authoritative;
 * a failed sync never breaks the streak.
 */

export const STREAK_STORAGE_KEY = 'awtsmoos-learning-streak-v1';
export const STREAK_SYNC_PATH = '/unified-social/activity';

const MAX_DAYS = 180;

function currentAlias() {
	return window.curAlias || window.currentAlias ||
		document.body?.dataset?.aliasId ||
		localStorage.getItem('awtsmoos-alias') || 'anonymous';
}

/** Local-calendar day key: "YYYY-MM-DD". */
export function dayKey(date = new Date()) {
	const y = date.getFullYear();
	const m = String(date.getMonth() + 1).padStart(2, '0');
	const d = String(date.getDate()).padStart(2, '0');
	return `${y}-${m}-${d}`;
}

function dayKeyOffset(offsetDays) {
	const d = new Date();
	d.setDate(d.getDate() + offsetDays);
	return dayKey(d);
}

function readAll() {
	try {
		const raw = localStorage.getItem(STREAK_STORAGE_KEY);
		const parsed = raw ? JSON.parse(raw) : null;
		return parsed && typeof parsed === 'object' ? parsed : {};
	} catch (_) { /* private mode */ return {}; }
}

function writeAll(all) {
	try {
		localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(all));
	} catch (_) { /* quota or private mode — the feed still works */ }
}

function stateFor(alias) {
	const all = readAll();
	const key = String(alias || 'anonymous');
	const s = all[key] && typeof all[key] === 'object' ? all[key] : {};
	return {
		all,
		key,
		days: Array.isArray(s.days) ? s.days.filter(x => /^\d{4}-\d{2}-\d{2}$/.test(String(x))) : [],
		lastSyncDay: String(s.lastSyncDay || ''),
		nudgeDay: String(s.nudgeDay || '')
	};
}

function saveState({ all, key, days, lastSyncDay, nudgeDay }) {
	const uniq = [...new Set(days)].sort();
	const pruned = uniq.slice(-MAX_DAYS);
	all[key] = { days: pruned, lastSyncDay, nudgeDay };
	writeAll(all);
	return pruned;
}

/**
 * Consecutive-day streak ending today (or yesterday when today is not yet
 * recorded — the streak is still alive until the day ends).
 */
function computeStreak(days) {
	const set = new Set(days);
	let count = 0;
	// Anchor: today if recorded, else yesterday; then walk backwards.
	let cursor = set.has(dayKey()) ? 0 : -1;
	while (set.has(dayKeyOffset(cursor))) {
		count++;
		cursor--;
	}
	return count;
}

/**
 * Marks today as a learning day for the current alias. Idempotent per day.
 * @returns {{ count: number, todayRecorded: boolean, newDay: boolean, alias: string }}
 */
export function recordLearningDay(alias) {
	const who = String(alias || currentAlias());
	const st = stateFor(who);
	const today = dayKey();
	const already = st.days.includes(today);
	if (!already) {
		st.days.push(today);
		saveState({ ...st, days: st.days });
		syncLearningDay(who, today, computeStreak(st.days));
	} else {
		saveState({ ...st, days: st.days }); // prunes + normalizes
	}
	const result = {
		count: computeStreak(st.days),
		todayRecorded: true,
		newDay: !already,
		alias: who
	};
	try {
		window.dispatchEvent(new CustomEvent('awtsmoos-streak', { detail: result }));
	} catch (_) { /* event buses must never throw */ }
	return result;
}

/** Current streak snapshot for an alias (defaults to the viewer). */
export function getStreak(alias) {
	const who = String(alias || currentAlias());
	const st = stateFor(who);
	const today = dayKey();
	return {
		count: computeStreak(st.days),
		todayRecorded: st.days.includes(today),
		lastDay: st.days.length ? st.days[st.days.length - 1] : '',
		totalDays: st.days.length,
		alias: who
	};
}

/**
 * Whether the gentle at-risk nudge may show: an alive streak (last learning
 * day was yesterday), today not yet recorded, and not dismissed today.
 */
export function streakNudgeDue(alias) {
	const who = String(alias || currentAlias());
	const st = stateFor(who);
	const today = dayKey();
	if (st.nudgeDay === today) return false;
	if (st.days.includes(today)) return false;
	return st.days.includes(dayKeyOffset(-1));
}

/** Remembers that today's nudge was shown or dismissed. */
export function markNudgeSeen(alias) {
	const who = String(alias || currentAlias());
	const st = stateFor(who);
	saveState({ ...st, days: st.days, nudgeDay: dayKey() });
}

/** Best-effort server sync: one POST per alias per day, never throws. */
async function syncLearningDay(alias, today, count) {
	if (alias === 'anonymous') return;
	const st = stateFor(alias);
	if (st.lastSyncDay === today) return;
	try {
		const res = await fetch(
			`${STREAK_SYNC_PATH}/${encodeURIComponent(alias)}`,
			{
				method: 'POST',
				credentials: 'same-origin',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					action: 'learning-day',
					category: 'content',
					date: today,
					streak: count,
					source: 'feed'
				})
			}
		);
		if (res.ok) saveState({ ...st, days: st.days, lastSyncDay: today });
	} catch (_) { /* offline or route missing — local streak stays authoritative */ }
}

/* ============ header widget + nudge banner ============ */

const FLAME_SVG = '<svg class="feed-ic" viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true" focusable="false"><path d="M12 21c-4 0-7-2.8-7-6.8 0-3 1.8-5.3 3.4-7.2.4 1.2 1 2.3 2 3.1.2-2.4 1.2-4.7 2.9-6.6 2.6 2.3 5.7 5.6 5.7 10.7 0 4-3 6.8-7 6.8z"/></svg>';

function streakLabel(count) {
	if (count <= 0) return 'No learning streak yet';
	return count === 1
		? '1 day of learning in a row'
		: `${count} days of learning in a row`;
}

/**
 * Renders the flame counter into the feed topbar and keeps it live.
 * @param {HTMLElement} topbar The .feed-topbar element.
 * @returns {HTMLElement|null} The widget, or null when no topbar.
 */
export function initStreakHeader(topbar) {
	if (!topbar) return null;
	const btn = document.createElement('button');
	btn.type = 'button';
	btn.className = 'feed-streak';
	btn.setAttribute('aria-live', 'polite');
	const paint = () => {
		const s = getStreak();
		btn.innerHTML = `${FLAME_SVG}<span class="feed-streak-count">${s.count}</span>`;
		btn.setAttribute('aria-label', `Learning streak: ${streakLabel(s.count)}`);
		btn.title = streakLabel(s.count);
		btn.classList.toggle('is-lit', s.count > 0);
	};
	paint();
	window.addEventListener('awtsmoos-streak', paint);
	// The widget is a mirror, not a button to anywhere: it reports only.
	btn.addEventListener('click', paint);
	const brand = topbar.querySelector('.feed-brand');
	if (brand && brand.nextSibling) topbar.insertBefore(btn, brand.nextSibling);
	else topbar.prepend(btn);
	return btn;
}

/**
 * Shows the one-per-day gentle nudge when an active streak is at risk.
 * @param {HTMLElement} main The .feed-main element (banner goes above tabs).
 * @returns {HTMLElement|null}
 */
export function maybeStreakNudge(main) {
	if (!main || !streakNudgeDue()) return null;
	const s = getStreak();
	const banner = document.createElement('div');
	banner.className = 'feed-streak-nudge';
	banner.setAttribute('role', 'status');
	const dayWord = s.count === 1 ? 'day' : 'days';
	banner.innerHTML =
		`<span class="feed-streak-nudge-flame" aria-hidden="true">${FLAME_SVG}</span>` +
		`<p class="feed-streak-nudge-text">Your ${s.count}-${dayWord} learning streak is still alive — open one teaching today to keep it going.</p>` +
		`<button type="button" class="feed-streak-nudge-ok">Keep going</button>` +
		`<button type="button" class="feed-streak-nudge-x" aria-label="Dismiss for today">✕</button>`;
	const dismiss = () => {
		markNudgeSeen();
		banner.remove();
	};
	banner.querySelector('.feed-streak-nudge-ok')?.addEventListener('click', dismiss);
	banner.querySelector('.feed-streak-nudge-x')?.addEventListener('click', dismiss);
	markNudgeSeen();
	const tabs = main.querySelector('.feed-tabs');
	if (tabs) main.insertBefore(banner, tabs);
	else main.prepend(banner);
	return banner;
}

/**
 * Wires streaks into the feed page: header widget + at-risk nudge.
 * Call recordLearningDay() from the river whenever the reader genuinely
 * reads (the 50%-visible card view hook in feed.js does this).
 */
export function initStreaks() {
	initStreakHeader(document.querySelector('.feed-topbar'));
	maybeStreakNudge(document.querySelector('.feed-main'));
}
