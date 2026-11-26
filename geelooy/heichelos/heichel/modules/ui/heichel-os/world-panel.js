// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module HeichelOsWorldPanel
 * @description
 * The Awtsmoos lets one live state illuminate both public profile and district
 * console without duplicating ownership inside Awtsmoos.com.
 */
import { districtCopy, districtTitle } from './world-data.js';
import { createWorldPanel } from './world-blueprints.js';

export function heichelWorldPanel(actions = {}) {
	return createWorldPanel({
		...actions,
		activateHeichelDistrict: actions.activateHeichelDistrict || activateDistrict
	});
}

export function renderHeichelWorldState({
	heichel = {},
	content = {},
	ownsIt = false,
	currentSeries = 'root'
} = {}) {
	// Counts describe the whole Heichel, not only the series currently
	// on screen: when the loaded series view is empty but the Heichel
	// record itself carries totals, the record wins over a misleading
	// zero. (A series view that does hold posts keeps its own count —
	// the larger of the two is the truthful floor either way.)
	// B"H 2026-11-25 (run 4): at the root the loader's Heichel-wide totals
	// (root posts + each top-level series' postsCount) join the max, so the
	// stats row cannot read 0 over content held inside the Heichel's series.
	const totals = currentSeries === 'root' ? content.totals : null;
	const counts = {
		posts: Math.max(
			count(content.posts),
			count(heichel.postCount ?? heichel.postsCount ?? heichel.teachingsCount),
			totals ? totals.teachings : 0
		),
		series: Math.max(
			count(content.subSeries),
			count(heichel.seriesCount ?? heichel.subSeriesCount),
			totals ? totals.series : 0
		),
		followers: count(heichel.followers || heichel.members || heichel.subscribers),
		mode: ownsIt ? 'owner' : 'visitor',
		currentSeries
	};
	paintProfileCounts(counts);
	const root = document.querySelector('[data-heichel-os-world]');
	if (!root) return;
	setText(root, '[data-heichel-os-name]', heichel.name || heichel.title || 'Living Heichel');
	setText(root, '[data-heichel-os-desc]', heichel.description || 'Live knowledge, people, and source paths.');
	for (const [key, value] of Object.entries(counts)) {
		setText(root, `[data-heichel-os-count="${key}"]`, value);
	}
}

export function activateDistrict(name = 'overview') {
	const root = document.querySelector('[data-heichel-os-world]');
	if (!root) return;
	root.querySelectorAll('[data-heichel-district]').forEach(button => {
		button.classList.toggle('active', button.dataset.heichelDistrict === name);
	});
	setText(root, '[data-heichel-district-title]', districtTitle(name));
	const body = root.querySelector('[data-heichel-district-body]');
	if (!body) return;
	body.replaceChildren(...districtCopy(name).map(paragraph));
	// B"H 2026-11-26 (Revelation fix, sections C+H): the Moderation
	// district was a copy-only stub -- its button opened no queue, so an
	// owner could never see submissions waiting for review. It now loads
	// the real Review Center queue for this Heichel.
	if (name === 'moderation') void paintModerationQueue(body);
}

/** Loads the owner's live submission queue into the Moderation district. */
async function paintModerationQueue(body) {
	const heichelId = (location.pathname.match(/\/heichelos\/([^/]+)/) || [])[1] || '';
	const aliasId = window.curAlias || '';
	const status = paragraph('Loading the review queue…');
	body.append(status);
	if (!heichelId || !aliasId) {
		status.textContent = 'Sign in as the Heichel owner to see submissions waiting for review.';
		return;
	}
	try {
		const response = await fetch(
			`/api/social/unified-social/heichelos/${encodeURIComponent(heichelId)}/review?aliasId=${encodeURIComponent(aliasId)}`,
			{ credentials: 'include' }
		);
		const data = await response.json().catch(() => null);
		const payload = data?.success ?? data;
		const items = Array.isArray(payload) ? payload
			: (payload?.submissions || payload?.queue || payload?.items || []);
		if (data?.error) throw new Error(data.error.message || data.error.code || 'queue unavailable');
		if (!items.length) {
			status.textContent = 'No submissions are waiting for review.';
			return;
		}
		status.textContent = `${items.length} submission${items.length === 1 ? '' : 's'} waiting for review:`;
		for (const item of items) {
			const line = paragraph(
				`• ${item.title || item.contentTitle || item.id || 'Submission'} — ${item.state || item.status || 'pending'}${item.submitterAliasId || item.aliasId ? ` · by ${item.submitterAliasId || item.aliasId}` : ''}`
			);
			body.append(line);
		}
	} catch (error) {
		status.textContent = `The review queue could not be loaded (${error.message}). Only the Heichel owner can see it.`;
	}
}

function paintProfileCounts(counts) {
	for (const [key, value] of Object.entries(counts)) {
		const node = document.querySelector(`[data-heichel-profile-count="${key}"]`);
		if (node) node.textContent = compactNumber(value);
	}
}

function setText(root, selector, value) {
	const node = root.querySelector(selector);
	if (node) node.textContent = value;
}

function paragraph(text) {
	const node = document.createElement('p');
	node.textContent = text;
	return node;
}

function count(value) {
	if (Array.isArray(value)) return value.length;
	if (value && typeof value === 'object') return Object.keys(value).length;
	return Number(value || 0) || 0;
}

function compactNumber(value) {
	return new Intl.NumberFormat('en', {
		notation: 'compact',
		maximumFractionDigits: 1
	}).format(value);
}
