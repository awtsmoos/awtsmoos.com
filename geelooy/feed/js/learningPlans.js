// B"H
/**
 * @module LearningPlans
 * @description
 * B"H — Yaakov 2026-10-13: daily learning plans. Built-in plans: Daf Yomi
 * (Bavli daily), Mishnah Yomis, Rambam Yomi (three chapters), and Chitas
 * (Tehillim by day of month, Tanya in a 65-chapter cycle, Chumash aliyah by
 * weekday with the user's own parsha name).
 *
 * Today's portion is computed from calendar anchors; the user marks it
 * complete and streaks are tracked in localStorage under
 * awtsmoos-feed-learning-plans.
 *
 * Plans may reference existing post IDs where available: each plan exposes
 * resolvePost(portion) -> postId|null. The default resolver returns null;
 * the feed can override it later to deep-link portions to live posts.
 */

import { icon, escapeHtml, escapeAttr } from './icons.js';

const STORE_KEY = 'awtsmoos-feed-learning-plans';
const DAY_MS = 86400000;

function readStore(fallback) {
	try {
		const raw = localStorage.getItem(STORE_KEY);
		return raw ? JSON.parse(raw) : fallback;
	} catch (_) { return fallback; }
}

function writeStore(value) {
	try { localStorage.setItem(STORE_KEY, JSON.stringify(value)); return true; }
	catch (_) { return false; }
}

function daysSince(anchorIso) {
	const anchor = Date.parse(anchorIso + 'T00:00:00Z');
	const now = Date.now();
	return Math.floor((now - anchor) / DAY_MS);
}

function todayKey(date = new Date()) {
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

/* ================= Daf Yomi ================= */
/* B"H — 14th Daf Yomi cycle anchor: 2020-01-05. Masechtot with their daf
   counts (Bavli daf-yomi numbering starts each masechta at daf 2). */

const DAF_YOMI_ANCHOR = '2020-01-05';
const BAVLI = [
	['Berachot', 64], ['Shabbat', 157], ['Eruvin', 105], ['Pesachim', 121],
	['Shekalim', 22], ['Yoma', 88], ['Sukkah', 56], ['Beitzah', 40],
	['Rosh Hashanah', 35], ['Taanit', 31], ['Megillah', 32], ['Moed Katan', 29],
	['Chagigah', 27], ['Yevamot', 122], ['Ketubot', 112], ['Nedarim', 91],
	['Nazir', 66], ['Sotah', 49], ['Gittin', 90], ['Kiddushin', 82],
	['Bava Kamma', 119], ['Bava Metzia', 119], ['Bava Batra', 176],
	['Sanhedrin', 113], ['Makkot', 24], ['Shevuot', 49], ['Avodah Zarah', 76],
	['Horayot', 14], ['Zevachim', 120], ['Menachot', 110], ['Chullin', 142],
	['Bechorot', 61], ['Arachin', 34], ['Temurah', 34], ['Keritot', 28],
	['Meilah', 22], ['Niddah', 73]
];
const DAF_YOMI_TOTAL = BAVLI.reduce((s, [, n]) => s + n, 0);

function dafYomiPortion() {
	const day = ((daysSince(DAF_YOMI_ANCHOR) % DAF_YOMI_TOTAL) + DAF_YOMI_TOTAL) % DAF_YOMI_TOTAL;
	let acc = 0;
	for (const [name, count] of BAVLI) {
		if (day < acc + count) {
			const daf = day - acc + 2;
			return { label: `${name} ${daf}`, detail: `Day ${day + 1} of the ${DAF_YOMI_TOTAL}-daf cycle` };
		}
		acc += count;
	}
	return { label: 'Niddah 73', detail: '' };
}

/* ================= Mishnah Yomis ================= */
/* One perek per day through all 524(ish) perakim; anchor 2024-01-01. */

const MISHNAH_ANCHOR = '2024-01-01';
const MISHNAH = [
	['Berachot', 9], ['Peah', 8], ['Demai', 7], ['Kilayim', 9], ['Sheviit', 10],
	['Terumot', 11], ['Maasrot', 5], ['Maaser Sheni', 5], ['Challah', 4],
	['Orlah', 3], ['Bikkurim', 3],
	['Shabbat', 24], ['Eruvin', 10], ['Pesachim', 10], ['Shekalim', 8],
	['Yoma', 8], ['Sukkah', 5], ['Beitzah', 5], ['Rosh Hashanah', 4],
	['Taanit', 4], ['Megillah', 4], ['Moed Katan', 3], ['Chagigah', 3],
	['Yevamot', 16], ['Ketubot', 13], ['Nedarim', 11], ['Nazir', 9],
	['Sotah', 9], ['Gittin', 9], ['Kiddushin', 4],
	['Bava Kamma', 10], ['Bava Metzia', 10], ['Bava Batra', 10],
	['Sanhedrin', 11], ['Makkot', 3], ['Shevuot', 8], ['Eduyot', 8],
	['Avodah Zarah', 5], ['Avot', 5], ['Horayot', 3],
	['Zevachim', 14], ['Menachot', 13], ['Chullin', 12], ['Bechorot', 9],
	['Arachin', 9], ['Temurah', 7], ['Keritot', 6], ['Meilah', 6],
	['Tamid', 7], ['Middot', 5], ['Kinnim', 3],
	['Kelim', 30], ['Oholot', 18], ['Negaim', 14], ['Parah', 12],
	['Taharot', 10], ['Mikvaot', 10], ['Niddah', 10], ['Machshirin', 6],
	['Zavim', 5], ['Tevul Yom', 4], ['Yadayim', 4], ['Uktzin', 3]
];
const MISHNAH_TOTAL = MISHNAH.reduce((s, [, n]) => s + n, 0);

function mishnahYomisPortion() {
	const day = ((daysSince(MISHNAH_ANCHOR) % MISHNAH_TOTAL) + MISHNAH_TOTAL) % MISHNAH_TOTAL;
	let acc = 0;
	for (const [name, count] of MISHNAH) {
		if (day < acc + count) {
			return { label: `${name}, perek ${day - acc + 1}`, detail: `Day ${day + 1} of ${MISHNAH_TOTAL}` };
		}
		acc += count;
	}
	return { label: 'Uktzin 3', detail: '' };
}

/* ================= Rambam Yomi (3 perakim) ================= */
/* 993 perakim / 3 per day = 331-day cycle. Portions are shown as global
   perek ranges so no sefer is ever mislabeled. Anchor 2024-01-01. */

const RAMBAM_ANCHOR = '2024-01-01';
const RAMBAM_TOTAL_PERAKIM = 993;
const RAMBAM_CYCLE_DAYS = Math.ceil(RAMBAM_TOTAL_PERAKIM / 3);

function rambamYomiPortion() {
	const day = ((daysSince(RAMBAM_ANCHOR) % RAMBAM_CYCLE_DAYS) + RAMBAM_CYCLE_DAYS) % RAMBAM_CYCLE_DAYS;
	const first = day * 3 + 1;
	const last = Math.min(RAMBAM_TOTAL_PERAKIM, first + 2);
	return {
		label: `Perakim ${first}–${last}`,
		detail: `Day ${day + 1} of ${RAMBAM_CYCLE_DAYS} · three chapters of Mishneh Torah`
	};
}

/* ================= Chitas ================= */
/* Tehillim by day of month (exact), Tanya 65-chapter cycle (Likutei Amarim
   53 + Igeres HaTeshuvah 12), Chumash aliyah by weekday — the parsha name
   follows the user's own community, so the user sets it once. */

const TANYA_ANCHOR = '2024-01-01';
const TANYA_TOTAL = 53 + 12;

function tehillimPortion(date = new Date()) {
	const d = date.getDate();
	const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
	if (daysInMonth === 29 && d === 29) {
		return { label: 'Tehillim 141–150', detail: 'Day 29 of a 29-day month covers the rest' };
	}
	const first = (d - 1) * 5 + 1;
	const last = Math.min(150, d * 5);
	return { label: `Tehillim ${first}–${last}`, detail: `Day ${d} of the month` };
}

function tanyaPortion() {
	const day = ((daysSince(TANYA_ANCHOR) % TANYA_TOTAL) + TANYA_TOTAL) % TANYA_TOTAL;
	const label = day < 53
		? `Tanya, Likutei Amarim ch. ${day + 1}`
		: `Tanya, Igeres HaTeshuvah ch. ${day - 52}`;
	return { label, detail: `Day ${day + 1} of ${TANYA_TOTAL}` };
}

const ALIYOT = ['Rishon', 'Sheni', 'Shelishi', 'Revi\u2019i', 'Chamishi', 'Shishi', 'Shevi\u2019i'];
function chumashPortion(store) {
	const weekday = new Date().getDay(); // 0 = Sunday
	const aliyah = ALIYOT[Math.min(6, weekday)];
	const parsha = store.chumashParsha || '';
	return {
		label: parsha ? `${parsha} — ${aliyah}` : `${aliyah} of this week's parsha`,
		detail: parsha ? 'Aliyah by weekday' : 'Set your parsha name below — it follows your shul’s cycle',
		needsParsha: !parsha
	};
}

/* ================= plan registry ================= */

const PLANS = [
	{
		id: 'daf-yomi',
		name: 'Daf Yomi',
		icon: 'book',
		description: 'One daf of Talmud Bavli every day — the whole Shas in about seven and a half years.',
		portion: () => dafYomiPortion(),
		resolvePost: () => null
	},
	{
		id: 'mishnah-yomis',
		name: 'Mishnah Yomis',
		icon: 'sheet',
		description: 'One perek of Mishnah a day, in order, through all six sedarim.',
		portion: () => mishnahYomisPortion(),
		resolvePost: () => null
	},
	{
		id: 'rambam-yomi',
		name: 'Rambam Yomi',
		icon: 'flag',
		description: 'Three chapters of Mishneh Torah daily — the full Rambam in under a year.',
		portion: () => rambamYomiPortion(),
		resolvePost: () => null
	},
	{
		id: 'chitas',
		name: 'Chitas',
		icon: 'spark',
		description: 'Chumash, Tehillim, and Tanya — the daily portions of Chabad.',
		portion: null, // composite: rendered specially
		resolvePost: () => null
	}
];

/* ================= completion store ================= */

function loadState() {
	return readStore({ done: {}, streaks: {}, chumashParsha: '' });
}

function saveState(state) {
	writeStore(state);
}

function isDoneToday(state, planId) {
	return state.done[`${planId}:${todayKey()}`] === true;
}

function markDone(state, planId) {
	const key = todayKey();
	state.done[`${planId}:${key}`] = true;
	// Recompute streak: consecutive days ending today.
	let streak = 0;
	const d = new Date();
	while (state.done[`${planId}:${todayKey(d)}`]) {
		streak += 1;
		d.setDate(d.getDate() - 1);
	}
	state.streaks[planId] = streak;
	saveState(state);
	return streak;
}

function unmarkDone(state, planId) {
	delete state.done[`${planId}:${todayKey()}`];
	state.streaks[planId] = 0;
	saveState(state);
}

/* ================= hub mount ================= */

export async function mount(el, ctx) {
	const state = loadState();

	function planCard(plan) {
		const done = isDoneToday(state, plan.id);
		const streak = state.streaks[plan.id] || 0;
		const portion = plan.portion ? plan.portion() : null;
		const postId = plan.resolvePost ? plan.resolvePost(portion) : null;
		const portionHtml = plan.id === 'chitas'
			? chitasHtml(state)
			: `<p class="plan-portion"><strong>${escapeHtml(portion.label)}</strong></p>
			   <p class="challenge-meta">${escapeHtml(portion.detail || '')}</p>`;
		return `
			<div class="learn-card${done ? ' plan-done' : ''}" data-plan="${escapeAttr(plan.id)}">
				<h4>${icon(plan.icon, 'feed-ic')} ${escapeHtml(plan.name)}</h4>
				<div class="plan-today">
					<h4>Today’s portion</h4>
					${portionHtml}
					${postId ? `<p class="challenge-meta">Post available in the river</p>` : ''}
				</div>
				<p>${escapeHtml(plan.description)}</p>
				<div class="learn-row">
					${done
						? `<button type="button" class="learn-btn" data-plan-act="undo">${icon('check')}<span>Done — undo</span></button>`
						: `<button type="button" class="learn-btn primary" data-plan-act="done">${icon('check')}<span>Mark complete</span></button>`}
				</div>
				${streak > 0 ? `<p class="plan-streak">🔥 ${streak}-day streak</p>` : ''}
			</div>`;
	}

	function chitasHtml(st) {
		const teh = tehillimPortion();
		const tan = tanyaPortion();
		const chu = chumashPortion(st);
		return `
			<p class="plan-portion"><strong>Chumash:</strong> ${escapeHtml(chu.label)}</p>
			<p class="plan-portion"><strong>Tehillim:</strong> ${escapeHtml(teh.label)} <span class="challenge-meta">${escapeHtml(teh.detail)}</span></p>
			<p class="plan-portion"><strong>Tanya:</strong> ${escapeHtml(tan.label)} <span class="challenge-meta">${escapeHtml(tan.detail)}</span></p>
			${chu.needsParsha ? `
				<div class="learn-row" style="margin-top:8px">
					<input class="learn-input" data-chitas-parsha maxlength="80" placeholder="This week's parsha (e.g. Bereshit)" value="${escapeAttr(st.chumashParsha || '')}" aria-label="This week's parsha name">
					<button type="button" class="learn-btn" data-plan-act="parsha">Set</button>
				</div>` : `
				<div class="learn-row" style="margin-top:8px">
					<button type="button" class="learn-btn" data-plan-act="parsha-clear">Change parsha</button>
				</div>`}`;
	}

	function render() {
		el.innerHTML = `
			<h3>Learning plans</h3>
			<p>Daily portions, computed for today. Mark each one complete as you learn — streaks build day by day.</p>
			${PLANS.map(planCard).join('')}`;
		el.querySelectorAll('[data-plan]').forEach(card => {
			const planId = card.dataset.plan;
			card.querySelectorAll('[data-plan-act]').forEach(btn => {
				btn.addEventListener('click', () => {
					const act = btn.dataset.planAct;
					if (act === 'done') markDone(state, planId);
					else if (act === 'undo') unmarkDone(state, planId);
					else if (act === 'parsha') {
						const input = card.querySelector('[data-chitas-parsha]');
						state.chumashParsha = (input?.value || '').trim().slice(0, 80);
						saveState(state);
					} else if (act === 'parsha-clear') {
						state.chumashParsha = '';
						saveState(state);
					}
					render();
				});
			});
		});
	}

	render();
}

export function initCardHooks() {
	// Plans live in the hub; no per-card buttons needed.
}
