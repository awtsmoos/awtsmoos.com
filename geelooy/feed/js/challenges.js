// B"H
/**
 * @module CommunityChallenges
 * @description
 * B"H — Yaakov 2026-10-13: community learning challenges. Create or join
 * challenges ("Learn 10 maamarim this month"), log progress, watch progress
 * bars and participant counts, and earn completion badges.
 *
 * Leaderboard rule (Yaakov): opt-in ONLY, no shaming — members who have not
 * opted in appear as "Anonymous learner" with their progress shown but no
 * name attached. Challenges are stored in localStorage under
 * awtsmoos-feed-challenges. Built-in challenge templates ship below.
 */

import { icon, escapeHtml, escapeAttr } from './icons.js';

const STORE_KEY = 'awtsmoos-feed-challenges';
const BADGE_KEY = 'awtsmoos-feed-challenge-badges';

function uid() {
	if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
	return 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

function readStore(key, fallback) {
	try {
		const raw = localStorage.getItem(key);
		return raw ? JSON.parse(raw) : fallback;
	} catch (_) { return fallback; }
}

function writeStore(key, value) {
	try { localStorage.setItem(key, JSON.stringify(value)); return true; }
	catch (_) { return false; }
}

function loadChallenges() {
	return readStore(STORE_KEY, []);
}

function saveChallenges(list) {
	return writeStore(STORE_KEY, list);
}

function loadBadges() {
	return readStore(BADGE_KEY, []);
}

function saveBadges(badges) {
	return writeStore(BADGE_KEY, badges);
}

function monthKey(date = new Date()) {
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function endOfMonthIso() {
	const d = new Date();
	const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
	return end.toISOString();
}

/** Built-in challenge templates (Yaakov 2026-10-13). */
function builtInTemplates() {
	const m = monthKey();
	return [
		{ id: 'tpl-maamarim-10', name: `Learn 10 maamarim this month`, unit: 'maamarim', target: 10, month: m },
		{ id: 'tpl-tehillim-150', name: `Finish all of Tehillim this month`, unit: 'perakim of Tehillim', target: 150, month: m },
		{ id: 'tpl-daf-30', name: `30 dafim in 30 days`, unit: 'dafim', target: 30, month: m },
		{ id: 'tpl-mishnayos-100', name: `100 mishnayos this month`, unit: 'mishnayos', target: 100, month: m }
	];
}

function displayName(member) {
	// Yaakov's rule: leaderboard is opt-in only, no shaming.
	if (member.optIn && member.name) return member.name;
	return 'Anonymous learner';
}

function isOwn(member, alias) {
	return member.alias === alias;
}

function memberProgress(member, challenge) {
	return Math.min(Number(challenge.target) || 1, Number(member.progress) || 0);
}

function challengePct(member, challenge) {
	const t = Math.max(1, Number(challenge.target) || 1);
	return Math.min(100, Math.round(memberProgress(member, challenge) / t * 100));
}

function isComplete(member, challenge) {
	return memberProgress(member, challenge) >= Math.max(1, Number(challenge.target) || 1);
}

function awardBadge(challenge, member) {
	const badges = loadBadges();
	const id = `${challenge.id}:${member.alias}`;
	if (badges.some(b => b.id === id)) return false;
	badges.unshift({
		id,
		challengeName: challenge.name,
		earnedAt: Date.now()
	});
	saveBadges(badges);
	return true;
}

function daysLeft(challenge) {
	const ms = Date.parse(challenge.endsAt || '') - Date.now();
	if (!Number.isFinite(ms)) return '';
	const d = Math.max(0, Math.ceil(ms / 86400000));
	return d === 0 ? 'ends today' : `${d} day${d === 1 ? '' : 's'} left`;
}

/* ================= hub mount ================= */

export async function mount(el, ctx) {
	const alias = ctx.alias || 'anonymous';
	const aliasName = alias === 'anonymous' ? '' : alias;

	function render() {
		const challenges = loadChallenges();
		const badges = loadBadges();
		const templates = builtInTemplates().filter(t =>
			!challenges.some(c => c.templateId === t.id && c.month === t.month));
		el.innerHTML = `
			<h3>Community challenges</h3>
			<p>Learn together. Join a challenge, log your progress, and earn a badge when you finish. The leaderboard only names people who opt in — everyone else stays anonymous.</p>

			${badges.length ? `<h3>Your badges (${badges.length})</h3>
				<div>${badges.map(b => `<span class="challenge-badge">${icon('trophy')}<span dir="auto">${escapeHtml(b.challengeName)}</span></span>`).join('')}</div>` : ''}

			${templates.length ? `<h3>Start one of these</h3>
				${templates.map(t => `
					<div class="challenge-card">
						<h4 dir="auto">${escapeHtml(t.name)}</h4>
						<p class="challenge-meta">Target: ${t.target} ${escapeHtml(t.unit)}</p>
						<div class="learn-row">
							<button type="button" class="learn-btn" data-tpl="${escapeAttr(t.id)}">${icon('plus')}<span>Start this challenge</span></button>
						</div>
					</div>`).join('')}` : ''}

			<h3>Make your own</h3>
			<div class="learn-card">
				<label class="learn-label" for="ch-name">Challenge name</label>
				<input class="learn-input" id="ch-name" maxlength="120" placeholder="e.g. Learn 5 sichos this month">
				<div class="learn-row">
					<div class="grow">
						<label class="learn-label" for="ch-target">Target number</label>
						<input class="learn-input" id="ch-target" type="number" min="1" max="100000" value="10">
					</div>
					<div class="grow">
						<label class="learn-label" for="ch-unit">Unit</label>
						<input class="learn-input" id="ch-unit" maxlength="40" placeholder="maamarim" value="maamarim">
					</div>
				</div>
				<div class="learn-row" style="margin-top:10px">
					<button type="button" class="learn-btn primary" data-ch="create">${icon('trophy')}<span>Create challenge</span></button>
				</div>
			</div>

			${challenges.length ? `<h3>Live challenges (${challenges.length})</h3>${challenges.map(c => challengeHtml(c, alias)).join('')}`
				: `<div class="learn-empty">${icon('trophy')}<p>No live challenges yet — start one above.</p></div>`}`;
		wire(el);
	}

	function challengeHtml(challenge, me) {
		const members = Array.isArray(challenge.members) ? challenge.members : [];
		const meMember = members.find(m => m.alias === me);
		const ranked = [...members].sort((a, b) => memberProgress(b, challenge) - memberProgress(a, challenge));
		const rows = ranked.slice(0, 12).map((m, i) => `
			<li>
				<span class="challenge-rank">${i + 1}</span>
				<span class="${isOwn(m, me) ? 'challenge-you' : ''}" dir="auto">${escapeHtml(displayName(m))}${isOwn(m, me) ? ' (you)' : ''}</span>
				<span class="grow"></span>
				<span class="challenge-meta">${memberProgress(m, challenge)} / ${challenge.target}</span>
			</li>`).join('');
		return `
			<div class="challenge-card" data-challenge="${escapeAttr(challenge.id)}">
				<h4 dir="auto">${escapeHtml(challenge.name)}</h4>
				<p class="challenge-meta">${members.length} participant${members.length === 1 ? '' : 's'} · target ${challenge.target} ${escapeHtml(challenge.unit || '')} · ${escapeHtml(daysLeft(challenge))}</p>
				${meMember ? `
					<div class="learn-progress" role="progressbar" aria-valuenow="${challengePct(meMember, challenge)}" aria-valuemin="0" aria-valuemax="100" aria-label="Your progress in ${escapeAttr(challenge.name)}">
						<div class="learn-progress-fill" style="width:${challengePct(meMember, challenge)}%"></div>
					</div>
					<div class="learn-progress-meta"><span>Your progress</span><span>${memberProgress(meMember, challenge)} / ${challenge.target} ${escapeHtml(challenge.unit || '')}</span></div>
					<div class="learn-row" style="margin-top:8px">
						${isComplete(meMember, challenge)
							? `<span class="challenge-badge">${icon('trophy')}<span>Complete</span></span>`
							: `<button type="button" class="learn-btn" data-ch-act="log">${icon('plus')}<span>Log one</span></button>`}
						<button type="button" class="learn-btn" data-ch-act="opt">${meMember.optIn ? 'Leave leaderboard' : 'Join leaderboard'}</button>
						<button type="button" class="learn-btn danger" data-ch-act="leave">Leave challenge</button>
					</div>`
				: `<div class="learn-row" style="margin-top:8px">
						<button type="button" class="learn-btn primary" data-ch-act="join">${icon('users')}<span>Join</span></button>
					</div>`}
				${ranked.length ? `<h4 style="margin-top:12px">Leaderboard</h4><ul class="challenge-leaderboard">${rows}</ul>
					<p class="challenge-meta">Only members who opted in are named.</p>` : ''}
			</div>`;
	}

	function wire(root) {
		root.querySelectorAll('[data-tpl]').forEach(btn => {
			btn.addEventListener('click', () => {
				const t = builtInTemplates().find(x => x.id === btn.dataset.tpl);
				if (!t) return;
				const challenges = loadChallenges();
				challenges.unshift({
					id: uid(),
					templateId: t.id,
					month: t.month,
					name: t.name,
					unit: t.unit,
					target: t.target,
					createdBy: alias,
					createdAt: Date.now(),
					endsAt: endOfMonthIso(),
					members: [{ alias, name: aliasName, progress: 0, optIn: false }]
				});
				saveChallenges(challenges);
				render();
			});
		});
		root.querySelector('[data-ch="create"]')?.addEventListener('click', () => {
			const name = root.querySelector('#ch-name').value.trim();
			const target = Math.max(1, Math.min(100000, Number(root.querySelector('#ch-target').value) || 1));
			const unit = root.querySelector('#ch-unit').value.trim().slice(0, 40) || 'units';
			if (!name) { root.querySelector('#ch-name').focus(); return; }
			const challenges = loadChallenges();
			challenges.unshift({
				id: uid(),
				name,
				unit,
				target,
				createdBy: alias,
				createdAt: Date.now(),
				endsAt: endOfMonthIso(),
				members: [{ alias, name: aliasName, progress: 0, optIn: false }]
			});
			saveChallenges(challenges);
			render();
		});
		root.querySelectorAll('[data-challenge]').forEach(card => {
			const id = card.dataset.challenge;
			card.querySelectorAll('[data-ch-act]').forEach(btn => {
				btn.addEventListener('click', () => {
					const challenges = loadChallenges();
					const ch = challenges.find(c => c.id === id);
					if (!ch) return;
					ch.members = Array.isArray(ch.members) ? ch.members : [];
					let me = ch.members.find(m => m.alias === alias);
					const act = btn.dataset.chAct;
					if (act === 'join') {
						if (!me) {
							me = { alias, name: aliasName, progress: 0, optIn: false };
							ch.members.push(me);
						}
					} else if (act === 'log' && me) {
						me.progress = (Number(me.progress) || 0) + 1;
						if (isComplete(me, ch) && awardBadge(ch, me)) {
							saveChallenges(challenges);
							render();
							alert(`Mazel tov! You completed “${ch.name}” and earned a badge.`);
							return;
						}
					} else if (act === 'opt' && me) {
						me.optIn = !me.optIn;
						if (!aliasName) me.name = '';
					} else if (act === 'leave') {
						ch.members = ch.members.filter(m => m.alias !== alias);
					}
					saveChallenges(challenges);
					render();
				});
			});
		});
	}

	render();
}

export function initCardHooks() {
	// Challenges live in the hub; no per-card buttons needed.
}
