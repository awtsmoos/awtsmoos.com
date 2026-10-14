// B"H
/**
 * @module FeedLeaderboard
 * @description
 * B"H — Yaakov 2026-10-13 (TRACK F engagement): top answerers leaderboard for
 * Q&A posts. Weekly / monthly / all-time boards celebrating contributors —
 * answers given, best answers, helpful votes. OPT-IN ONLY: a learner appears
 * with their display name only if they opted in; everyone else is folded into
 * a single "Anonymous learner" aggregate line so the board never shames.
 * No raw IDs are ever rendered; only display names the user chose.
 *
 * Storage: awtsmoos-feed-leaderboard-v1 — bounded answer-event log (2000)
 * plus per-alias opt-in flags.
 *
 * Other modules call window.awtsmoosRecordAnswer({ alias, displayName, best,
 * helpfulVotes }) when an answer is posted / voted on.
 */

import { icon, escapeHtml, escapeAttr, timeAgo } from './icons.js';

const STORE_KEY = 'awtsmoos-feed-leaderboard-v1';
const EVENT_MAX = 2000;
const WEEK_MS = 7 * 24 * 3600 * 1000;
const MONTH_MS = 30 * 24 * 3600 * 1000;

const PERIODS = {
	week: { label: 'This week', ms: WEEK_MS },
	month: { label: 'This month', ms: MONTH_MS },
	all: { label: 'All time', ms: Infinity }
};

function readStore() {
	try {
		const raw = localStorage.getItem(STORE_KEY);
		const parsed = raw ? JSON.parse(raw) : null;
		if (parsed && typeof parsed === 'object') {
			return { events: Array.isArray(parsed.events) ? parsed.events : [], optIn: parsed.optIn && typeof parsed.optIn === 'object' ? parsed.optIn : {} };
		}
	} catch (_) { /* fall through */ }
	return { events: [], optIn: {} };
}

function writeStore(store) {
	try {
		localStorage.setItem(STORE_KEY, JSON.stringify({
			events: store.events.slice(-EVENT_MAX),
			optIn: store.optIn
		}));
		return true;
	} catch (_) { return false; }
}

function currentAlias() {
	return window.curAlias || window.currentAlias ||
		document.body?.dataset?.aliasId ||
		localStorage.getItem('awtsmoos-alias') || 'anonymous';
}

/** Public recording API for Q&A activity. */
export function recordAnswer({ alias, displayName, best = false, helpfulVotes = 0 } = {}) {
	if (!alias) return false;
	const store = readStore();
	store.events.push({
		alias: String(alias),
		name: displayName ? String(displayName) : null,
		ts: Date.now(),
		best: !!best,
		votes: Math.max(0, Number(helpfulVotes) || 0)
	});
	writeStore(store);
	window.dispatchEvent(new CustomEvent('awtsmoos-leaderboard-changed'));
	return true;
}

/** Aggregate events within a period. Returns ranked rows (celebratory only). */
export function boardFor(period = 'week', limit = 25) {
	const ms = PERIODS[period] ? PERIODS[period].ms : WEEK_MS;
	const cutoff = ms === Infinity ? 0 : Date.now() - ms;
	const store = readStore();
	const byAlias = new Map();
	for (const e of store.events) {
		if (e.ts < cutoff) continue;
		let agg = byAlias.get(e.alias);
		if (!agg) {
			agg = { alias: e.alias, name: e.name, answers: 0, best: 0, votes: 0 };
			byAlias.set(e.alias, agg);
		}
		if (e.name && !agg.name) agg.name = e.name;
		agg.answers += 1;
		if (e.best) agg.best += 1;
		agg.votes += e.votes;
	}
	const rows = [];
	let anon = null;
	for (const agg of byAlias.values()) {
		if (store.optIn[agg.alias]) {
			rows.push({ ...agg, anonymous: false });
		} else {
			if (!anon) anon = { alias: 'anonymous', name: 'Anonymous learner', answers: 0, best: 0, votes: 0, anonymous: true };
			anon.answers += agg.answers;
			anon.best += agg.best;
			anon.votes += agg.votes;
		}
	}
	rows.sort((a, b) => (b.votes * 2 + b.best * 5 + b.answers) - (a.votes * 2 + a.best * 5 + a.answers));
	const ranked = rows.slice(0, limit);
	if (anon && anon.answers) ranked.push(anon);
	return ranked;
}

export function isOptedIn(alias = currentAlias()) {
	return !!readStore().optIn[String(alias)];
}

export function setOptedIn(alias, value) {
	const store = readStore();
	store.optIn[String(alias)] = !!value;
	writeStore(store);
	window.dispatchEvent(new CustomEvent('awtsmoos-leaderboard-changed'));
}

export function initLeaderboard() {
	const stage = document.getElementById('feed-stage');
	const topbar = stage?.querySelector('.feed-topbar');
	if (!stage || !topbar) return;

	window.awtsmoosRecordAnswer = recordAnswer;

	const btn = document.createElement('button');
	btn.type = 'button';
	btn.className = 'feed-ic-btn feed-leaderboard-btn';
	btn.id = 'feed-leaderboard-btn';
	btn.setAttribute('aria-label', 'Top answerers leaderboard');
	btn.setAttribute('aria-haspopup', 'dialog');
	btn.setAttribute('aria-expanded', 'false');
	btn.title = 'Top answerers';
	btn.innerHTML = `${icon('trophy')}`;

	const notifBell = topbar.querySelector('#feed-notif-bell');
	if (notifBell) topbar.insertBefore(btn, notifBell);
	else {
		const themeDrop = topbar.querySelector('#feed-theme-drop');
		if (themeDrop) topbar.insertBefore(btn, themeDrop);
		else topbar.appendChild(btn);
	}

	const panel = document.createElement('div');
	panel.className = 'feed-leaderboard-panel';
	panel.id = 'feed-leaderboard-panel';
	panel.setAttribute('role', 'dialog');
	panel.setAttribute('aria-label', 'Top answerers leaderboard');
	panel.hidden = true;
	stage.appendChild(panel);

	const backdrop = document.createElement('div');
	backdrop.className = 'feed-leaderboard-backdrop';
	backdrop.hidden = true;
	stage.appendChild(backdrop);

	let period = 'week';

	function openPanel() {
		panel.hidden = false;
		backdrop.hidden = false;
		btn.setAttribute('aria-expanded', 'true');
		renderPanel();
	}

	function closePanel() {
		panel.hidden = true;
		backdrop.hidden = true;
		btn.setAttribute('aria-expanded', 'false');
	}

	btn.addEventListener('click', () => (panel.hidden ? openPanel() : closePanel()));
	backdrop.addEventListener('click', closePanel);
	document.addEventListener('keydown', (e) => {
		if (e.key === 'Escape' && !panel.hidden) closePanel();
	});

	function renderPanel() {
		const me = String(currentAlias());
		const opted = isOptedIn(me);
		const rows = boardFor(period, 25);
		const tabs = Object.entries(PERIODS).map(([key, p]) => `
			<button type="button" class="feed-leaderboard-tab${period === key ? ' is-active' : ''}" data-period="${escapeAttr(key)}" ${period === key ? 'aria-current="true"' : ''}>${escapeHtml(p.label)}</button>
		`).join('');
		const rowsHtml = rows.length ? rows.map((r, i) => {
			const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
			return `
			<li class="feed-leaderboard-row${r.anonymous ? ' is-anon' : ''}">
				<span class="feed-leaderboard-rank" aria-hidden="true">${medal}</span>
				<span class="feed-leaderboard-name">${escapeHtml(r.name || 'A fellow learner')}</span>
				<span class="feed-leaderboard-stats">
					<span class="feed-leaderboard-stat" title="Answers given">${escapeHtml(String(r.answers))} answers</span>
					<span class="feed-leaderboard-stat" title="Chosen as best answer">${escapeHtml(String(r.best))} best</span>
					<span class="feed-leaderboard-stat" title="Helpful votes">${escapeHtml(String(r.votes))} helpful</span>
				</span>
			</li>`;
		}).join('') : `<li class="feed-leaderboard-empty">No answers on the board yet for ${escapeHtml(PERIODS[period].label.toLowerCase())}. Opt in below and be the first to be celebrated.</li>`;

		panel.innerHTML = `
			<div class="feed-leaderboard-head">
				<h2 class="feed-leaderboard-title">Top answerers</h2>
				<p class="feed-leaderboard-sub">Celebrating the learners who lift others. Opt-in only — no names without consent.</p>
			</div>
			<div class="feed-leaderboard-tabs" role="tablist" aria-label="Leaderboard period">${tabs}</div>
			<ol class="feed-leaderboard-list">${rowsHtml}</ol>
			<label class="feed-leaderboard-optin">
				<span class="feed-leaderboard-optin-text">
					<span class="feed-leaderboard-optin-name">Appear on the leaderboard</span>
					<span class="feed-leaderboard-optin-hint">Your display name and answer stats will be visible to other learners.</span>
				</span>
				<input type="checkbox" class="feed-notif-switch" id="feed-leaderboard-optin-switch" ${opted ? 'checked' : ''}>
			</label>`;

		panel.querySelectorAll('[data-period]').forEach((tab) => {
			tab.addEventListener('click', () => {
				period = tab.getAttribute('data-period');
				renderPanel();
			});
		});
		panel.querySelector('#feed-leaderboard-optin-switch').addEventListener('change', (e) => {
			setOptedIn(me, e.target.checked);
			renderPanel();
		});
	}

	window.addEventListener('awtsmoos-leaderboard-changed', () => {
		if (!panel.hidden) renderPanel();
	});
}
