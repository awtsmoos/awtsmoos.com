// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module FamilyGroups
 * @description
 * Yaakov 2026-10-13: TRACK C — private family learning groups for the
 * Awtsmoos feed.
 *
 * 1. A floating "Family groups" button opens the groups panel.
 * 2. Create a group: pick a name, get a friendly invite code (two words +
 *    digits) that family can type to join, plus a copyable join link.
 * 3. Each group has:
 *      - a shared feed (messages visible only to members),
 *      - a family learning plan (shared, editable text),
 *      - group challenges (title + target + progress, mark done),
 *      - a member list where the admin can remove members.
 * 4. The first member is the admin. Joining happens by invite code.
 *
 * Privacy: the shared feed, plan, and challenges live inside the group
 * record and are never shown outside the group view. User-facing text
 * never exposes raw IDs or machine slugs.
 *
 * NOTE: there is no server sync yet. Groups live on this device in
 * localStorage; a join link opened on another device will prompt for the
 * code. FAMILY_SYNC_ENDPOINT is the hook for the future server route.
 */

export const FAMILY_SYNC_ENDPOINT = null; // no server route yet — see note above

const LS_GROUPS = 'awtsmoos-family-groups-v1';

const CODE_WORDS_A = ['kind', 'brave', 'gentle', 'bright', 'warm', 'noble', 'true', 'sweet'];
const CODE_WORDS_B = ['lion', 'dove', 'star', 'river', 'cedar', 'flame', 'olive', 'harp'];

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */

function escapeHtml(s) {
	return String(s ?? '').replace(/[&<>"']/g, c => ({
		'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
	}[c]));
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

function currentAlias() {
	return window.curAlias || window.currentAlias ||
		document.body?.dataset?.aliasId ||
		localStorage.getItem('awtsmoos-alias') || 'anonymous';
}

function displayName() {
	return (localStorage.getItem('awtsmoos-alias-name') || '').trim() ||
		(currentAlias() === 'anonymous' ? 'Family member' : 'Family member');
}

function loadGroups() {
	const g = readJson(LS_GROUPS, []);
	return Array.isArray(g) ? g : [];
}

function saveGroups(groups) {
	writeJson(LS_GROUPS, groups);
}

function makeInviteCode() {
	const a = CODE_WORDS_A[Math.floor(Math.random() * CODE_WORDS_A.length)];
	const b = CODE_WORDS_B[Math.floor(Math.random() * CODE_WORDS_B.length)];
	const n = String(Math.floor(1000 + Math.random() * 9000));
	return `${a}-${b}-${n}`;
}

function joinLink(code) {
	return `${location.origin}/feed/?family=${encodeURIComponent(code)}`;
}

function timeAgo(ts) {
	const s = Math.max(1, Math.floor((Date.now() - ts) / 1000));
	if (s < 60) return 'just now';
	const m = Math.floor(s / 60);
	if (m < 60) return m + 'm ago';
	const h = Math.floor(m / 60);
	if (h < 24) return h + 'h ago';
	return Math.floor(h / 24) + 'd ago';
}

/* ------------------------------------------------------------------ */
/* the groups panel                                                    */
/* ------------------------------------------------------------------ */

let panelOpen = false;

function svgHome() {
	return '<svg class="fg-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M4 11.5 12 4l8 7.5"/><path d="M6 10.5V20h12v-9.5"/><path d="M10 20v-5h4v5"/></svg>';
}

export function initFamilyGroups() {
	const stage = document.getElementById('feed-stage') || document.body;
	if (stage.querySelector('.fg-fab')) return;
	const fab = document.createElement('button');
	fab.type = 'button';
	fab.className = 'fg-fab';
	fab.setAttribute('aria-label', 'Family learning groups');
	fab.title = 'Family learning groups';
	fab.innerHTML = svgHome() + '<span>Family groups</span>';
	fab.addEventListener('click', openPanel);
	stage.append(fab);

	// Deep link: /feed/?family=<code> focuses the join box.
	try {
		const code = new URLSearchParams(location.search).get('family');
		if (code) openPanel(code);
	} catch (_) {}
}

function openPanel(prefillCode) {
	if (panelOpen) return;
	panelOpen = true;
	const overlay = document.createElement('div');
	overlay.className = 'fg-overlay';
	overlay.innerHTML =
		'<div class="fg-panel" role="dialog" aria-modal="true" aria-label="Family learning groups">' +
			'<div class="fg-panel-head">' +
				'<h2 class="fg-panel-title">Family groups</h2>' +
				'<button type="button" class="fg-close" aria-label="Close family groups">✕</button>' +
			'</div>' +
			'<div class="fg-panel-body"></div>' +
		'</div>';
	document.body.append(overlay);
	const body = overlay.querySelector('.fg-panel-body');
	const close = () => { panelOpen = false; overlay.remove(); document.removeEventListener('keydown', onKey, true); };
	const onKey = (e) => { if (e.key === 'Escape') close(); };
	document.addEventListener('keydown', onKey, true);
	overlay.querySelector('.fg-close').addEventListener('click', close);
	overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

	renderList(body, close, prefillCode);
}

/* ---- group list / create / join ---- */

function renderList(body, close, prefillCode) {
	const groups = loadGroups();
	body.innerHTML =
		'<p class="fg-lede">Private learning spaces for your family — invite by code, learn together.</p>' +
		(groups.length
			? '<div class="fg-groups">' + groups.map((g, i) =>
				'<div class="fg-group-card">' +
					`<div class="fg-group-top"><span class="fg-group-name">${escapeHtml(g.name)}</span>` +
					`<span class="fg-group-count">${g.members.length} member${g.members.length === 1 ? '' : 's'}</span></div>` +
					`<button type="button" class="fg-btn fg-btn-primary" data-open="${i}">Open group</button>` +
				'</div>').join('') + '</div>'
			: '<p class="fg-empty">No family groups yet. Create one below to start learning together.</p>') +
		'<div class="fg-create-row">' +
			'<section class="fg-card" aria-label="Create a group">' +
				'<h3 class="fg-card-title">Create a group</h3>' +
				'<form class="fg-create-form">' +
					'<label class="fg-field"><span class="fg-label">Group name</span>' +
						'<input class="fg-input" name="name" maxlength="60" placeholder="e.g. The Cohen Family" required></label>' +
					'<button type="submit" class="fg-btn fg-btn-primary">Create group</button>' +
				'</form>' +
			'</section>' +
			'<section class="fg-card" aria-label="Join a group">' +
				'<h3 class="fg-card-title">Join with a code</h3>' +
				'<form class="fg-join-form">' +
					'<label class="fg-field"><span class="fg-label">Invite code</span>' +
						`<input class="fg-input" name="code" maxlength="40" placeholder="kind-lion-4821" value="${escapeHtml(prefillCode || '')}"></label>` +
					'<button type="submit" class="fg-btn">Join group</button>' +
				'</form>' +
				'<p class="fg-error" role="alert" hidden></p>' +
			'</section>' +
		'</div>';

	body.querySelectorAll('[data-open]').forEach(btn => {
		btn.addEventListener('click', () => {
			const groups2 = loadGroups();
			const g = groups2[Number(btn.dataset.open)];
			if (g) renderDetail(body, close, g.code);
		});
	});

	body.querySelector('.fg-create-form').addEventListener('submit', (e) => {
		e.preventDefault();
		const name = String(new FormData(e.currentTarget).get('name') || '').trim();
		if (!name) return;
		const groups2 = loadGroups();
		const code = makeInviteCode();
		groups2.unshift({
			code,
			name,
			createdAt: Date.now(),
			members: [{ name: displayName(), role: 'admin', joinedAt: Date.now() }],
			feed: [],
			plan: { text: '', updatedAt: 0, updatedBy: '' },
			challenges: []
		});
		saveGroups(groups2);
		renderDetail(body, close, code);
	});

	const joinError = body.querySelector('.fg-error');
	body.querySelector('.fg-join-form').addEventListener('submit', (e) => {
		e.preventDefault();
		const code = String(new FormData(e.currentTarget).get('code') || '').trim().toLowerCase();
		const groups2 = loadGroups();
		const g = groups2.find(x => String(x.code).toLowerCase() === code);
		if (!g) {
			joinError.textContent = 'That invite code was not found on this device. Check the code and try again.';
			joinError.hidden = false;
			return;
		}
		if (!g.members.some(m => m.name === displayName())) {
			g.members.push({ name: displayName(), role: 'member', joinedAt: Date.now() });
			saveGroups(groups2);
		}
		renderDetail(body, close, g.code);
	});
}

function findGroup(code) {
	return loadGroups().find(g => String(g.code).toLowerCase() === String(code).toLowerCase());
}

function persistGroup(updated) {
	const groups = loadGroups();
	const i = groups.findIndex(g => String(g.code).toLowerCase() === String(updated.code).toLowerCase());
	if (i >= 0) { groups[i] = updated; saveGroups(groups); }
}

/* ---- group detail ---- */

function renderDetail(body, close, code) {
	const g = findGroup(code);
	if (!g) { renderList(body, close); return; }
	const me = g.members.find(m => m.name === displayName());
	const isAdmin = !!(me && me.role === 'admin');

	body.innerHTML =
		'<button type="button" class="fg-back">← All groups</button>' +
		'<div class="fg-detail-head">' +
			`<h3 class="fg-detail-title">${escapeHtml(g.name)}</h3>` +
			(isAdmin ? '<span class="fg-admin-tag">You are the admin</span>' : '') +
		'</div>' +
		'<section class="fg-card" aria-label="Invite">' +
			'<h4 class="fg-card-title">Invite family</h4>' +
			'<div class="fg-invite-row">' +
				`<code class="fg-code">${escapeHtml(g.code)}</code>` +
				'<button type="button" class="fg-btn fg-copy-code">Copy code</button>' +
				'<button type="button" class="fg-btn fg-copy-link">Copy invite link</button>' +
			'</div>' +
			'<p class="fg-dim">Share the code or link with family — they type the code to join.</p>' +
		'</section>' +
		'<section class="fg-card" aria-label="Shared feed">' +
			'<h4 class="fg-card-title">Family feed</h4>' +
			'<div class="fg-messages"></div>' +
			'<form class="fg-msg-form">' +
				'<div class="fg-msg-row">' +
					'<input class="fg-input" name="text" maxlength="1000" autocomplete="off" placeholder="Share with the family…" aria-label="Write a family message">' +
					'<button type="submit" class="fg-btn fg-btn-primary">Post</button>' +
				'</div>' +
			'</form>' +
		'</section>' +
		'<div class="fg-cols">' +
			'<section class="fg-card" aria-label="Family learning plan">' +
				'<h4 class="fg-card-title">Learning plan</h4>' +
				`<textarea class="fg-textarea" rows="5" placeholder="e.g. One perek of Tehillim together every night…">${escapeHtml(g.plan.text || '')}</textarea>` +
				(g.plan.updatedAt ? `<p class="fg-dim">Updated ${timeAgo(g.plan.updatedAt)}${g.plan.updatedBy ? ` by ${escapeHtml(g.plan.updatedBy)}` : ''}</p>` : '') +
				'<button type="button" class="fg-btn fg-btn-primary fg-plan-save">Save plan</button>' +
			'</section>' +
			'<section class="fg-card" aria-label="Group challenges">' +
				'<h4 class="fg-card-title">Group challenges</h4>' +
				'<div class="fg-challenges"></div>' +
				'<form class="fg-challenge-form">' +
					'<label class="fg-field"><span class="fg-label">New challenge</span>' +
						'<input class="fg-input" name="title" maxlength="120" placeholder="e.g. Learn 10 mishnayos by Friday" required></label>' +
					'<label class="fg-field"><span class="fg-label">Target <span class="fg-optional">(number to reach)</span></span>' +
						'<input class="fg-input" name="target" type="number" min="1" max="10000" value="10"></label>' +
					'<button type="submit" class="fg-btn">Add challenge</button>' +
				'</form>' +
			'</section>' +
		'</div>' +
		'<section class="fg-card" aria-label="Members">' +
			'<h4 class="fg-card-title">Members</h4>' +
			'<div class="fg-members"></div>' +
		'</section>';

	body.querySelector('.fg-back').addEventListener('click', () => renderList(body, close));

	const flash = (btn, text) => {
		const orig = btn.textContent;
		btn.textContent = text;
		setTimeout(() => { btn.textContent = orig; }, 1500);
	};
	body.querySelector('.fg-copy-code').addEventListener('click', async (e) => {
		try { await navigator.clipboard.writeText(g.code); flash(e.currentTarget, 'Copied'); }
		catch (_) { flash(e.currentTarget, 'Copy failed'); }
	});
	body.querySelector('.fg-copy-link').addEventListener('click', async (e) => {
		try { await navigator.clipboard.writeText(joinLink(g.code)); flash(e.currentTarget, 'Copied'); }
		catch (_) { flash(e.currentTarget, 'Copy failed'); }
	});

	/* shared feed */
	const messagesBox = body.querySelector('.fg-messages');
	function paintMessages() {
		const g2 = findGroup(code);
		const feed = Array.isArray(g2.feed) ? g2.feed : [];
		messagesBox.innerHTML = feed.length
			? feed.map(m =>
				'<div class="fg-msg">' +
					`<div class="fg-msg-head"><span class="fg-msg-author">${escapeHtml(m.author)}</span>` +
					`<time class="fg-msg-time">${timeAgo(m.at)}</time></div>` +
					`<p class="fg-msg-text" dir="auto">${escapeHtml(m.text)}</p>` +
				'</div>').join('')
			: '<p class="fg-dim">Nothing shared yet — post the first family update.</p>';
	}
	paintMessages();
	body.querySelector('.fg-msg-form').addEventListener('submit', (e) => {
		e.preventDefault();
		const input = e.currentTarget.querySelector('input[name="text"]');
		const text = input.value.trim();
		if (!text) return;
		const g2 = findGroup(code);
		g2.feed = Array.isArray(g2.feed) ? g2.feed : [];
		g2.feed.unshift({ id: `m-${Date.now().toString(36)}`, author: displayName(), text, at: Date.now() });
		g2.feed = g2.feed.slice(0, 200);
		persistGroup(g2);
		input.value = '';
		paintMessages();
	});

	/* learning plan */
	body.querySelector('.fg-plan-save').addEventListener('click', (e) => {
		const g2 = findGroup(code);
		g2.plan = {
			text: body.querySelector('.fg-textarea').value,
			updatedAt: Date.now(),
			updatedBy: displayName()
		};
		persistGroup(g2);
		flash(e.currentTarget, 'Saved');
	});

	/* challenges */
	const challengesBox = body.querySelector('.fg-challenges');
	function paintChallenges() {
		const g2 = findGroup(code);
		const list = Array.isArray(g2.challenges) ? g2.challenges : [];
		challengesBox.innerHTML = list.length
			? list.map((c, i) => {
				const pct = c.target > 0 ? Math.min(100, Math.round((c.progress / c.target) * 100)) : 0;
				return '<div class="fg-challenge' + (c.done ? ' is-done' : '') + '">' +
					'<div class="fg-challenge-main">' +
						`<span class="fg-challenge-title">${escapeHtml(c.title)}</span>` +
						'<div class="fg-progress" role="progressbar" aria-valuenow="' + pct + '" aria-valuemin="0" aria-valuemax="100" aria-label="' + escapeHtml(c.title) + ' progress">' +
							`<span class="fg-progress-fill" style="width:${pct}%"></span>` +
						'</div>' +
						`<span class="fg-challenge-count">${c.progress} / ${c.target}</span>` +
					'</div>' +
					'<div class="fg-challenge-tools">' +
						(c.done
							? '<span class="fg-done-tag">Complete</span>'
							: `<button type="button" class="fg-linkbtn" data-act="step" data-i="${i}">+1</button>` +
							  `<button type="button" class="fg-linkbtn" data-act="done" data-i="${i}">Mark done</button>`) +
						`<button type="button" class="fg-linkbtn fg-danger" data-act="del" data-i="${i}">Remove</button>` +
					'</div>' +
				'</div>';
			}).join('')
			: '<p class="fg-dim">No challenges yet — set the family\'s first goal.</p>';
		challengesBox.querySelectorAll('[data-act]').forEach(btn => {
			btn.addEventListener('click', () => {
				const g3 = findGroup(code);
				const idx = Number(btn.dataset.i);
				const c = g3.challenges[idx];
				if (!c) return;
				if (btn.dataset.act === 'step') c.progress = Math.min(c.target, (c.progress || 0) + 1);
				else if (btn.dataset.act === 'done') { c.done = true; c.progress = c.target; }
				else g3.challenges.splice(idx, 1);
				persistGroup(g3);
				paintChallenges();
			});
		});
	}
	paintChallenges();
	body.querySelector('.fg-challenge-form').addEventListener('submit', (e) => {
		e.preventDefault();
		const fd = new FormData(e.currentTarget);
		const title = String(fd.get('title') || '').trim();
		const target = Math.max(1, Math.min(10000, Number(fd.get('target')) || 10));
		if (!title) return;
		const g2 = findGroup(code);
		g2.challenges = Array.isArray(g2.challenges) ? g2.challenges : [];
		g2.challenges.unshift({
			id: `c-${Date.now().toString(36)}`, title, target,
			progress: 0, done: false, createdBy: displayName(), at: Date.now()
		});
		persistGroup(g2);
		e.currentTarget.reset();
		paintChallenges();
	});

	/* members */
	const membersBox = body.querySelector('.fg-members');
	function paintMembers() {
		const g2 = findGroup(code);
		membersBox.innerHTML = g2.members.map((m, i) =>
			'<div class="fg-member">' +
				`<span class="fg-member-avatar" aria-hidden="true">${escapeHtml(initialsOf(m.name))}</span>` +
				`<span class="fg-member-name">${escapeHtml(m.name)}</span>` +
				(m.role === 'admin' ? '<span class="fg-admin-badge">Admin</span>' : '') +
				(isAdmin && m.name !== displayName()
					? `<button type="button" class="fg-linkbtn fg-danger" data-remove="${i}">Remove</button>`
					: '') +
			'</div>').join('');
		membersBox.querySelectorAll('[data-remove]').forEach(btn => {
			btn.addEventListener('click', () => {
				const g3 = findGroup(code);
				g3.members.splice(Number(btn.dataset.remove), 1);
				persistGroup(g3);
				paintMembers();
			});
		});
	}
	paintMembers();
}

function initialsOf(name) {
	const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
	if (!parts.length) return '•';
	return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
}
