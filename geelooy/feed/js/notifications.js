// B"H
/**
 * @module FeedNotifications
 * @description
 * B"H — Yaakov 2026-10-13 (TRACK F engagement): smart notifications for the
 * Awtsmoos River. A bell in the feed topbar opens a notification center with
 * a localStorage-backed queue; smart triggers listen for feed events
 * (chavrusa progress, answers to your questions, streak at risk, new posts in
 * followed heichelos, siyum milestones from people you follow). Browser
 * Notification API permission is requested with ONE polite opt-in prompt.
 * Preferences live in a modal (toggle each type, master switch, daily-digest
 * mode capped at 3 digests/day — never spam). No raw IDs are ever shown.
 *
 * Storage:
 *   awtsmoos-feed-notifications-v1 — the queue (bounded to 50, oldest pruned)
 *   awtsmoos-feed-notif-prefs-v1   — prefs + one-time prompt flags
 *   awtsmoos-feed-notif-digest-v1  — digest bucket when digest mode is on
 *
 * Other modules fire window CustomEvents OR call window.awtsmoosNotify():
 *   awtsmoos-chavrusa-progress  { partnerName, progress, link }
 *   awtsmoos-qa-answer          { questionTitle, answererName, link }
 *   awtsmoos-siyum-milestone    { whoName, milestone, link }
 *   awtsmoos-heichel-post       { heichelName, postTitle, link }
 * Streak risk is checked internally against streaks.js (evening + no day yet).
 */

import { icon, escapeHtml, escapeAttr, timeAgo } from './icons.js';

const QUEUE_KEY = 'awtsmoos-feed-notifications-v1';
const PREFS_KEY = 'awtsmoos-feed-notif-prefs-v1';
const DIGEST_KEY = 'awtsmoos-feed-notif-digest-v1';
const QUEUE_MAX = 50;
const DIGEST_MAX_PER_DAY = 3;

export const NOTIF_TYPES = {
	chavrusa: { label: 'Chavrusa progress', hint: 'Your chavrusa partner made progress on a shared plan.' },
	answer: { label: 'Answers to your questions', hint: 'Someone answered a question you asked.' },
	streak: { label: 'Streak at risk', hint: 'One gentle nudge when a learning streak may lapse — never nagging.' },
	heichel: { label: 'Followed heichelos', hint: 'New posts in heichelos you follow.' },
	siyum: { label: 'Siyum milestones', hint: 'Siyum milestones from people you follow.' }
};

function readJson(key, fallback) {
	try {
		const raw = localStorage.getItem(key);
		return raw ? JSON.parse(raw) : fallback;
	} catch (_) { return fallback; }
}

function writeJson(key, value) {
	try { localStorage.setItem(key, JSON.stringify(value)); return true; }
	catch (_) { return false; }
}

function uid() {
	if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
	return 'n' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

function defaultPrefs() {
	return {
		enabled: true,
		digest: false,
		types: Object.fromEntries(Object.keys(NOTIF_TYPES).map((t) => [t, true])),
		promptAsked: false,
		promptDismissedAt: 0,
		browserOk: false
	};
}

function loadPrefs() {
	const p = readJson(PREFS_KEY, null);
	if (!p || typeof p !== 'object') return defaultPrefs();
	const d = defaultPrefs();
	return {
		...d,
		...p,
		types: { ...d.types, ...(p.types || {}) }
	};
}

function savePrefs(p) {
	return writeJson(PREFS_KEY, p);
}

function loadQueue() {
	const q = readJson(QUEUE_KEY, []);
	return Array.isArray(q) ? q : [];
}

function saveQueue(q) {
	return writeJson(QUEUE_KEY, q.slice(-QUEUE_MAX));
}

function loadDigest() {
	const d = readJson(DIGEST_KEY, null);
	return d && typeof d === 'object' ? d : { items: [], digestsSentToday: 0, dayKey: dayKey() };
}

function saveDigest(d) {
	return writeJson(DIGEST_KEY, d);
}

function dayKey(date = new Date()) {
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function unreadCount(queue) {
	return queue.filter((n) => !n.read).length;
}

/** Fire a system notification when allowed (browser permission + prefs). */
function systemNotify(title, body) {
	try {
		if (!('Notification' in window)) return;
		if (Notification.permission !== 'granted') return;
		const n = new Notification(title, { body: String(body || '').slice(0, 140), tag: 'awtsmoos-feed' });
		n.onclick = () => { try { window.focus(); n.close(); } catch (_) { } };
	} catch (_) { /* Notification API unavailable or blocked */ }
}

/**
 * Public trigger API: window.awtsmoosNotify(type, { title, body, link, actor, key }).
 * type must be one of NOTIF_TYPES. Dedupes by key; respects prefs + digest.
 */
export function notify(type, data = {}) {
	const t = NOTIF_TYPES[type] ? type : null;
	if (!t) return null;
	const prefs = loadPrefs();
	if (!prefs.enabled || prefs.types[t] === false) return null;

	const key = String(data.key || `${t}:${data.title || ''}`);
	const queue = loadQueue();

	// Spam guard: same key unread within 4h is skipped.
	const cutoff = Date.now() - 4 * 3600 * 1000;
	if (queue.some((n) => n.key === key && !n.read && n.ts > cutoff)) return null;

	const item = {
		id: uid(),
		key,
		type: t,
		title: String(data.title || NOTIF_TYPES[t].label),
		body: String(data.body || ''),
		link: data.link ? String(data.link) : null,
		actor: data.actor ? String(data.actor) : null,
		ts: Date.now(),
		read: false
	};

	if (prefs.digest) {
		const bucket = loadDigest();
		if (bucket.dayKey !== dayKey()) {
			bucket.dayKey = dayKey();
			bucket.items = [];
			bucket.digestsSentToday = 0;
		}
		bucket.items.push(item);
		saveDigest(bucket);
		maybeEmitDigest();
	} else {
		queue.push(item);
		saveQueue(queue);
		systemNotify(item.title, item.body);
	}

	window.dispatchEvent(new CustomEvent('awtsmoos-notifications-changed'));
	return item.id;
}

/** Digest mode: roll the bucket into a digest item, capped at 3/day. */
function maybeEmitDigest() {
	const prefs = loadPrefs();
	if (!prefs.digest) return;
	const bucket = loadDigest();
	if (!bucket.items.length) return;
	if (bucket.dayKey !== dayKey()) {
		bucket.dayKey = dayKey();
		bucket.digestsSentToday = 0;
	}
	if (bucket.digestsSentToday >= DIGEST_MAX_PER_DAY) {
		saveDigest(bucket);
		return; // quota exhausted — bucket keeps accruing silently, no spam
	}
	const items = bucket.items.splice(0, bucket.items.length);
	const lines = items.map((i) => `${i.title}: ${i.body}`).join('\n').slice(0, 220);
	const digest = {
		id: uid(),
		key: `digest:${dayKey()}:${bucket.digestsSentToday + 1}`,
		type: 'digest',
		title: `Your daily learning digest (${items.length})`,
		body: lines,
		link: null,
		actor: null,
		ts: Date.now(),
		read: false,
		digestItems: items
	};
	bucket.digestsSentToday += 1;
	saveDigest(bucket);
	const queue = loadQueue();
	queue.push(digest);
	saveQueue(queue);
	systemNotify(digest.title, `${items.length} updates waiting for you.`);
	window.dispatchEvent(new CustomEvent('awtsmoos-notifications-changed'));
}

/** Streak-at-risk check: evening, active streak, no learning day yet today. */
async function checkStreakRisk() {
	const prefs = loadPrefs();
	if (!prefs.enabled || prefs.types.streak === false) return;
	try {
		const mod = await import('./streaks.js?v=1');
		const snap = mod.getStreak ? mod.getStreak() : null;
		if (!snap || !snap.count || snap.todayRecorded) return;
		const hour = new Date().getHours();
		if (hour < 17) return; // only gentle evening nudges
		notify('streak', {
			key: `streak:${dayKey()}`,
			title: 'Your learning streak is at risk',
			body: `A ${snap.count}-day streak is a gift — even a few minutes of Torah keeps it alive tonight.`,
			link: '/feed/'
		});
	} catch (_) { /* streaks module optional */ }
}

/** Render + wire the bell button, panel, prefs modal, and the one polite prompt. */
export function initNotifications() {
	const stage = document.getElementById('feed-stage');
	const topbar = stage?.querySelector('.feed-topbar');
	if (!stage || !topbar) return;

	window.awtsmoosNotify = notify;

	const bell = document.createElement('button');
	bell.type = 'button';
	bell.className = 'feed-ic-btn feed-notif-bell';
	bell.id = 'feed-notif-bell';
	bell.setAttribute('aria-label', 'Notifications');
	bell.setAttribute('aria-haspopup', 'dialog');
	bell.setAttribute('aria-expanded', 'false');
	bell.innerHTML = `${icon('bell')}<span class="feed-notif-badge" id="feed-notif-badge" hidden></span>`;

	const themeDrop = topbar.querySelector('#feed-theme-drop');
	if (themeDrop) topbar.insertBefore(bell, themeDrop);
	else topbar.appendChild(bell);

	const panel = document.createElement('div');
	panel.className = 'feed-notif-panel';
	panel.id = 'feed-notif-panel';
	panel.setAttribute('role', 'dialog');
	panel.setAttribute('aria-label', 'Notification center');
	panel.hidden = true;
	stage.appendChild(panel);

	const backdrop = document.createElement('div');
	backdrop.className = 'feed-notif-backdrop';
	backdrop.hidden = true;
	stage.appendChild(backdrop);

	function paint() {
		const queue = loadQueue();
		const unread = unreadCount(queue);
		const badge = document.getElementById('feed-notif-badge');
		if (badge) {
			badge.hidden = unread === 0;
			badge.textContent = unread > 99 ? '99+' : String(unread);
		}
		bell.setAttribute('aria-label', unread ? `Notifications, ${unread} unread` : 'Notifications');
		if (!panel.hidden) renderPanel();
	}

	function renderPanel() {
		const queue = loadQueue().slice().reverse();
		const list = queue.length
			? queue.map((n) => {
				const typeLabel = n.type === 'digest' ? 'Daily digest' : (NOTIF_TYPES[n.type]?.label || 'Update');
				return `
				<article class="feed-notif-item${n.read ? ' is-read' : ''}" data-notif-id="${escapeAttr(n.id)}">
					<div class="feed-notif-item-head">
						<span class="feed-notif-type">${escapeHtml(typeLabel)}</span>
						<time class="feed-notif-time" datetime="${new Date(n.ts).toISOString()}">${escapeHtml(timeAgo(n.ts))}</time>
					</div>
					<h3 class="feed-notif-title">${escapeHtml(n.title)}</h3>
					${n.body ? `<p class="feed-notif-body">${escapeHtml(n.body)}</p>` : ''}
					${n.link ? `<a class="feed-notif-link" href="${escapeAttr(n.link)}">Open</a>` : ''}
				</article>`;
			}).join('')
			: `<p class="feed-notif-empty">All quiet. When your chavrusa learns, your questions get answers, or a siyum is celebrated, you'll hear it here first.</p>`;
		panel.innerHTML = `
			<div class="feed-notif-head">
				<h2 class="feed-notif-title-lg">Notifications</h2>
				<div class="feed-notif-head-actions">
					<button type="button" class="feed-notif-text-btn" data-notif="read-all">Mark all read</button>
					<button type="button" class="feed-notif-text-btn" data-notif="prefs">Preferences</button>
				</div>
			</div>
			<div class="feed-notif-list">${list}</div>`;
		panel.querySelector('[data-notif="read-all"]').addEventListener('click', () => {
			const q = loadQueue().map((n) => ({ ...n, read: true }));
			saveQueue(q);
			window.dispatchEvent(new CustomEvent('awtsmoos-notifications-changed'));
		});
		panel.querySelector('[data-notif="prefs"]').addEventListener('click', () => {
			closePanel();
			openPrefs();
		});
		panel.querySelectorAll('.feed-notif-item').forEach((el) => {
			el.addEventListener('click', () => {
				const id = el.getAttribute('data-notif-id');
				const q = loadQueue().map((n) => (n.id === id ? { ...n, read: true } : n));
				saveQueue(q);
				window.dispatchEvent(new CustomEvent('awtsmoos-notifications-changed'));
			});
		});
	}

	function openPanel() {
		panel.hidden = false;
		backdrop.hidden = false;
		bell.setAttribute('aria-expanded', 'true');
		renderPanel();
	}

	function closePanel() {
		panel.hidden = true;
		backdrop.hidden = true;
		bell.setAttribute('aria-expanded', 'false');
	}

	bell.addEventListener('click', () => (panel.hidden ? openPanel() : closePanel()));
	backdrop.addEventListener('click', closePanel);
	document.addEventListener('keydown', (e) => {
		if (e.key === 'Escape' && !panel.hidden) closePanel();
	});

	function openPrefs() {
		const prefs = loadPrefs();
		const typeRows = Object.entries(NOTIF_TYPES).map(([t, meta]) => `
			<label class="feed-notif-pref-row">
				<span class="feed-notif-pref-text">
					<span class="feed-notif-pref-name">${escapeHtml(meta.label)}</span>
					<span class="feed-notif-pref-hint">${escapeHtml(meta.hint)}</span>
				</span>
				<input type="checkbox" class="feed-notif-switch" data-pref-type="${escapeAttr(t)}" ${prefs.types[t] ? 'checked' : ''}>
			</label>`).join('');
		const modal = document.createElement('div');
		modal.className = 'feed-notif-modal';
		modal.setAttribute('role', 'dialog');
		modal.setAttribute('aria-modal', 'true');
		modal.setAttribute('aria-label', 'Notification preferences');
		modal.innerHTML = `
			<div class="feed-notif-modal-card">
				<div class="feed-notif-head">
					<h2 class="feed-notif-title-lg">Notification preferences</h2>
					<button type="button" class="feed-ic-btn feed-notif-modal-close" data-notif="close" aria-label="Close preferences">${icon('close')}</button>
				</div>
				<label class="feed-notif-pref-row">
					<span class="feed-notif-pref-text">
						<span class="feed-notif-pref-name">All notifications</span>
						<span class="feed-notif-pref-hint">Master switch. Off means complete silence.</span>
					</span>
					<input type="checkbox" class="feed-notif-switch" data-pref="enabled" ${prefs.enabled ? 'checked' : ''}>
				</label>
				${typeRows}
				<label class="feed-notif-pref-row">
					<span class="feed-notif-pref-text">
						<span class="feed-notif-pref-name">Daily digest (max 3/day)</span>
						<span class="feed-notif-pref-hint">Roll updates into a short daily digest instead of instant pings.</span>
					</span>
					<input type="checkbox" class="feed-notif-switch" data-pref="digest" ${prefs.digest ? 'checked' : ''}>
				</label>
				<div class="feed-notif-pref-foot">
					<button type="button" class="feed-notif-text-btn" data-notif="browser">Enable browser notifications</button>
					<button type="button" class="feed-notif-text-btn feed-notif-clear" data-notif="clear">Clear all notifications</button>
				</div>
			</div>`;
		modal.querySelector('[data-notif="close"]').addEventListener('click', () => modal.remove());
		modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
		modal.querySelectorAll('[data-pref-type]').forEach((sw) => {
			sw.addEventListener('change', () => {
				const p = loadPrefs();
				p.types[sw.getAttribute('data-pref-type')] = sw.checked;
				savePrefs(p);
			});
		});
		modal.querySelectorAll('[data-pref]').forEach((sw) => {
			sw.addEventListener('change', () => {
				const p = loadPrefs();
				p[sw.getAttribute('data-pref')] = sw.checked;
				savePrefs(p);
			});
		});
		modal.querySelector('[data-notif="browser"]').addEventListener('click', () => requestBrowserPermission(true));
		modal.querySelector('[data-notif="clear"]').addEventListener('click', () => {
			saveQueue([]);
			saveDigest({ items: [], digestsSentToday: 0, dayKey: dayKey() });
			window.dispatchEvent(new CustomEvent('awtsmoos-notifications-changed'));
			modal.remove();
		});
		document.addEventListener('keydown', function esc(e) {
			if (e.key === 'Escape') { modal.remove(); document.removeEventListener('keydown', esc); }
		});
		stage.appendChild(modal);
	}

	/** The one polite browser-notification prompt. force=true when user asked. */
	function requestBrowserPermission(force = false) {
		if (!('Notification' in window)) return;
		const p = loadPrefs();
		if (Notification.permission === 'granted') {
			p.browserOk = true;
			savePrefs(p);
			return;
		}
		if (!force && (p.promptAsked || Notification.permission === 'denied')) return;
		if (!force) {
			p.promptAsked = true;
			savePrefs(p);
			showPolitePrompt();
			return;
		}
		try {
			const res = Notification.requestPermission();
			if (res && res.then) {
				res.then((perm) => {
					const q = loadPrefs();
					q.browserOk = perm === 'granted';
					savePrefs(q);
				});
			}
		} catch (_) { /* ignore */ }
	}

	function showPolitePrompt() {
		if (document.querySelector('.feed-notif-perm')) return;
		const bar = document.createElement('div');
		bar.className = 'feed-notif-perm';
		bar.setAttribute('role', 'dialog');
		bar.setAttribute('aria-label', 'Browser notification permission');
		bar.innerHTML = `
			<span class="feed-notif-perm-ic">${icon('bell')}</span>
			<span class="feed-notif-perm-text"><strong>Gentle updates?</strong> Allow browser notifications for chavrusa news, answers, and streak nudges. One permission — you control every type in Preferences.</span>
			<button type="button" class="feed-notif-perm-ok">Allow</button>
			<button type="button" class="feed-notif-perm-no">Not now</button>`;
		bar.querySelector('.feed-notif-perm-ok').addEventListener('click', () => {
			requestBrowserPermission(true);
			bar.remove();
		});
		bar.querySelector('.feed-notif-perm-no').addEventListener('click', () => {
			const p = loadPrefs();
			p.promptDismissedAt = Date.now();
			savePrefs(p);
			bar.remove();
		});
		const main = stage.querySelector('.feed-main') || stage;
		main.insertBefore(bar, main.firstChild);
	}

	// ---- smart trigger wiring ----
	window.addEventListener('awtsmoos-chavrusa-progress', (e) => {
		const d = e.detail || {};
		notify('chavrusa', {
			key: `chavrusa:${d.planId || ''}:${d.unit || ''}`,
			title: 'Your chavrusa made progress',
			body: `${d.partnerName || 'Your chavrusa partner'} completed ${d.unit || 'the next unit'}${d.planName ? ` of ${d.planName}` : ''}.`,
			link: d.link || '/feed/',
			actor: d.partnerName || null
		});
	});
	window.addEventListener('awtsmoos-qa-answer', (e) => {
		const d = e.detail || {};
		notify('answer', {
			key: `answer:${d.questionId || ''}:${d.answerId || ''}`,
			title: 'Someone answered your question',
			body: `${d.answererName || 'A fellow learner'} answered: ${d.questionTitle || 'your question'}.`,
			link: d.link || '/feed/',
			actor: d.answererName || null
		});
	});
	window.addEventListener('awtsmoos-siyum-milestone', (e) => {
		const d = e.detail || {};
		notify('siyum', {
			key: `siyum:${d.trackId || ''}:${d.milestone || ''}`,
			title: 'Siyum milestone',
			body: `${d.whoName || 'Someone you follow'} reached: ${d.milestone || 'a siyum milestone'}. Mazal tov!`,
			link: d.link || '/feed/',
			actor: d.whoName || null
		});
	});
	window.addEventListener('awtsmoos-heichel-post', (e) => {
		const d = e.detail || {};
		notify('heichel', {
			key: `heichel:${d.heichelId || ''}:${d.postId || ''}`,
			title: `New in ${d.heichelName || 'a heichel you follow'}`,
			body: d.postTitle || 'A new post is waiting.',
			link: d.link || '/feed/',
			actor: d.heichelName || null
		});
	});
	window.addEventListener('awtsmoos-notifications-changed', paint);

	paint();
	checkStreakRisk();
	setInterval(checkStreakRisk, 30 * 60 * 1000);

	// One polite browser-permission prompt, delayed so the feed paints first.
	setTimeout(() => requestBrowserPermission(false), 9000);
}
