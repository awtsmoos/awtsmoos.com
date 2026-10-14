// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module FeedActivity
 * @description
 * Yaakov 2026-10-13: one honest record of what a reader does on the feed —
 * reactions, comments, shares, saves, and posts viewed — kept on the reader's
 * own device in a bounded ring buffer. No nudges, no streaks, no dark
 * patterns: the record is a mirror, never a lever.
 *
 * NOTE (2026-10-13): server sync is intentionally OFF. There is NO
 * `/api/social/activity` route in geelooy/api/social/ — the only server-side
 * activity ledger lives at `/unified-social/activity/:alias`, an
 * owner-verified, private-by-default ledger with a different contract than
 * this client record. Until a dedicated public sync route ships, everything
 * stays in localStorage on this device only. Parent agent: that route is the
 * missing piece for cross-device activity.
 */

export const ACTIVITY_SYNC_ENDPOINT = null;

const STORAGE_KEY = 'awtsmoos-activity-v1';
const PRIVACY_KEY = 'awtsmoos-activity-privacy-v1';
const MAX_EVENTS = 1000;
const VIEW_DEDUPE_MS = 10 * 60 * 1000; // one recorded view per post per 10 minutes

const KINDS = new Set(['reaction', 'comment', 'share', 'save', 'view', 'post']);

/** Mirrors the alias detection chain in feed.js / cards.js. */
export function currentAlias() {
	return window.curAlias || window.currentAlias ||
		document.body?.dataset?.aliasId ||
		localStorage.getItem('awtsmoos-alias') || 'anonymous';
}

function readJson(key, fallback) {
	try {
		const raw = localStorage.getItem(key);
		if (!raw) return fallback;
		const parsed = JSON.parse(raw);
		return parsed === null || parsed === undefined ? fallback : parsed;
	} catch (_) { /* private mode */ return fallback; }
}

function writeJson(key, value) {
	try {
		localStorage.setItem(key, JSON.stringify(value));
	} catch (_) { /* quota or private mode — the feed still works */ }
}

/**
 * Records one user action. Views are deduplicated so scrolling past the same
 * card repeatedly does not inflate the record.
 * @param {string} kind One of: reaction, comment, share, save, view, post.
 * @param {object} [detail] { aliasId, targetType, targetId, targetTitle, emoji, removed, url }
 * @returns {object|null} The stored event, or null when ignored.
 */
export function logActivity(kind, detail = {}) {
	if (!KINDS.has(kind)) return null;
	const now = Date.now();
	const events = readJson(STORAGE_KEY, []);
	const targetId = String(detail.targetId ?? '');
	if (kind === 'view' && targetId) {
		const recent = events.find(e =>
			e.kind === 'view' && String(e.targetId) === targetId && (now - e.at) < VIEW_DEDUPE_MS);
		if (recent) return null;
	}
	const event = {
		id: `${now}-${Math.random().toString(36).slice(2, 8)}`,
		kind,
		at: now,
		aliasId: String(detail.aliasId || currentAlias()),
		targetType: String(detail.targetType || 'post'),
		targetId,
		targetTitle: String(detail.targetTitle || ''),
		emoji: String(detail.emoji || ''),
		removed: detail.removed === true,
		url: String(detail.url || '')
	};
	events.push(event);
	if (events.length > MAX_EVENTS) events.splice(0, events.length - MAX_EVENTS);
	writeJson(STORAGE_KEY, events);
	return event;
}

/**
 * Reads the stored activity, newest first.
 * @param {object} [opts] { aliasId, limit }
 * @returns {Array<object>}
 */
export function getActivity({ aliasId = '', limit = 100 } = {}) {
	const events = readJson(STORAGE_KEY, []);
	const list = Array.isArray(events) ? events : [];
	const filtered = aliasId
		? list.filter(e => String(e.aliasId) === String(aliasId))
		: list;
	return filtered.slice(-Math.max(1, limit)).reverse();
}

/** Empties the local activity record. */
export function clearActivity() {
	writeJson(STORAGE_KEY, []);
}

/**
 * Privacy preference: "Hide my activity". Stored per alias; defaults to
 * visible. When ON, other viewers see "Activity hidden" on the profile tab.
 */
export function isActivityHidden(aliasId) {
	const map = readJson(PRIVACY_KEY, {});
	return map[String(aliasId)] === true;
}

export function setActivityHidden(aliasId, hidden) {
	const map = readJson(PRIVACY_KEY, {});
	if (hidden) map[String(aliasId)] = true;
	else delete map[String(aliasId)];
	writeJson(PRIVACY_KEY, map);
	try {
		window.dispatchEvent(new CustomEvent('awtsmoos-activity-privacy', {
			detail: { aliasId: String(aliasId), hidden: !!hidden }
		}));
	} catch (_) { /* event buses must never throw */ }
}

/** Human-readable sentence for one event. Raw ids are never shown. */
export function describeActivity(event = {}) {
	const title = event.targetTitle ? ` “${event.targetTitle}”` : '';
	switch (event.kind) {
		case 'reaction':
			if (event.removed) return `withdrew a reaction from${title}`;
			return `reacted ${event.emoji || '👍'} to${title}`;
		case 'comment': return `commented on${title}`;
		case 'share': return `shared${title}`;
		case 'save':
			return event.removed ? `unsaved${title}` : `saved${title}`;
		case 'view': return `read${title}`;
		case 'post': return `published${title}`;
		default: return `acted on${title}`;
	}
}

/** Emoji marker shown beside an event in the activity list. */
export function activityMarker(event = {}) {
	if (event.kind === 'reaction' && event.emoji) return event.emoji;
	return { reaction: '👍', comment: '💬', share: '📤', save: '🔖', view: '👁️', post: '✨' }[event.kind] || '✨';
}
