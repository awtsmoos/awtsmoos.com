// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ProfileActivity
 * @description
 * Yaakov 2026-10-13: the Profile Activity tab reads the reader's own local
 * activity record (reactions, comments, shares, saves, reads — newest first)
 * and renders it as a plain honest list. Raw ids are never displayed.
 * Privacy: when the owner enables "Hide my activity", other viewers see
 * "Activity hidden" instead of the list. /profile is the owner's own
 * chamber, so the owner always sees their list plus a reminder note; the
 * `viewerAliasId` parameter lets future alias pages (/@) reuse this for
 * genuine other-viewer rendering.
 */
import {
	getActivity,
	describeActivity,
	activityMarker,
	isActivityHidden
} from '/feed/js/activity.js';
import { state } from './state.js';

function esc(s) {
	return String(s ?? '')
		.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

function timeAgo(ts) {
	const s = Math.max(1, Math.floor((Date.now() - Number(ts)) / 1000));
	if (s < 60) return s + 's ago';
	const m = Math.floor(s / 60);
	if (m < 60) return m + 'm ago';
	const h = Math.floor(m / 60);
	if (h < 24) return h + 'h ago';
	const d = Math.floor(h / 24);
	if (d < 30) return d + 'd ago';
	return new Date(Number(ts)).toLocaleDateString();
}

function ownerAlias() {
	const aliases = Array.isArray(state.aliases) ? state.aliases : [];
	const primary = aliases.find(a => a && a.default) || aliases[0];
	return String(primary?.id || state.defaultAlias || 'anonymous');
}

function hiddenCard() {
	return `<div class="pd-activity-hidden" role="status">
		<h4>Activity hidden</h4>
		<p>This reader keeps their activity private.</p>
	</div>`;
}

/**
 * Renders the Activity tab panel for the profile owner.
 * @param {string|null} [viewerAliasId] Alias of the viewer; defaults to the owner.
 * @returns {Promise<void>}
 */
export async function renderProfileActivity(viewerAliasId = null) {
	const list = document.querySelector('[data-profile-panel="activity"] .activity-list');
	if (!list) return;
	const owner = ownerAlias();
	const viewer = String(viewerAliasId || owner);
	const hidden = isActivityHidden(owner);
	if (hidden && viewer !== owner) {
		list.innerHTML = hiddenCard();
		return;
	}
	const events = getActivity({ aliasId: owner, limit: 60 });
	const note = hidden
		? `<div class="pd-activity-note" role="note"><span aria-hidden="true">🔒</span><span>Only you see this — your activity is hidden from everyone else. Change this in Settings.</span></div>`
		: '';
	if (!events.length) {
		list.innerHTML = note + `<div class="pd-activity-empty"><p>No activity yet. Reactions, comments, shares, saves and reads will appear here.</p></div>`;
		return;
	}
	list.innerHTML = note + events.map(e => `
		<article class="pd-activity-row">
			<span class="pd-activity-marker" aria-hidden="true">${esc(activityMarker(e))}</span>
			<div class="pd-activity-body">
				<p class="pd-activity-text">You ${esc(describeActivity(e))}</p>
				<time class="pd-activity-time">${esc(timeAgo(e.at))}</time>
			</div>
		</article>`).join('');
}
