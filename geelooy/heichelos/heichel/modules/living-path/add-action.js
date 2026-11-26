// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module LivingPathAddAction
 * @description
 * The Awtsmoos knows whose house this is before offering its keys;
 * Awtsmoos.com resolves the Heichel add action from the same verified
 * identity and destination access the composer itself trusts. The
 * owner is offered direct adding as the Heichel's own alias, a guest
 * of the house is offered an honest submission for review, and a
 * signed-out visitor is offered sign-in that returns to this page —
 * never a dead or misleading control. When resolution cannot complete
 * (load, network), the blueprint's generic deep link stays in place:
 * it already carries Heichel + series, and the composer verifies
 * everything again on arrival.
 */

import { appState } from '../state.js';

const IDENTITY_URL = '/api/social/unified-social/identity';
const detailUrl = (heichelId, seriesId, aliasId) =>
	`/api/social/unified-social/destinations/${encodeURIComponent(heichelId)}/${encodeURIComponent(seriesId)}?aliasId=${encodeURIComponent(aliasId || '')}`;
const ownershipUrl = (aliasId, heichelId) =>
	`/api/social/alias/${encodeURIComponent(aliasId)}/heichelos/${encodeURIComponent(heichelId)}/ownership`;

let identityPromise = null;
const detailPromises = new Map();
let runToken = 0;

async function fetchJson(url) {
	const response = await fetch(url, { headers: { Accept: 'application/json' } });
	if (!response.ok) throw new Error(`Request failed: ${response.status}`);
	const body = await response.json();
	return body?.success ?? body;
}

function loadIdentity() {
	if (!identityPromise) {
		identityPromise = fetchJson(IDENTITY_URL).catch(error => {
			identityPromise = null;
			throw error;
		});
	}
	return identityPromise;
}

function loadDetail(heichelId, seriesId, aliasId) {
	const key = `${aliasId}::${seriesId}`;
	if (!detailPromises.has(key)) {
		detailPromises.set(
			key,
			fetchJson(detailUrl(heichelId, seriesId, aliasId)).catch(() => null)
		);
	}
	return detailPromises.get(key);
}

function composerHref({ heichelId, seriesId, aliasId }) {
	const parameters = new URLSearchParams({ heichel: heichelId, series: seriesId });
	if (aliasId) parameters.set('alias', aliasId);
	return `/social-composer/?${parameters}`;
}

function applyState(element, { state, label, href, title }) {
	element.dataset.state = state;
	element.href = href;
	element.textContent = label;
	if (title) element.title = title;
	else element.removeAttribute('title');
	element.hidden = false;
}

/**
 * The destination detail of an older server build may not carry the
 * owner alias yet; the legacy ownership oracle can still name an
 * account alias the house recognizes as its own (owner/editor).
 * Asked once per account alias until one answers yes.
 */
async function probeOwnerAlias(heichelId, aliases) {
	for (const alias of aliases.slice(0, 6)) {
		try {
			const result = await fetchJson(ownershipUrl(alias.aliasId, heichelId));
			if (result?.yes) return alias.aliasId;
		} catch {
			/* a failed probe is not a no — keep asking */
		}
	}
	return '';
}

/** Resolves the hero add action for the Heichel + series now on stage. */
export async function resolveHeichelAddAction() {
	const element = document.getElementById('heichelAddAction');
	const heichelId = appState.heichelId;
	if (!element || !heichelId) return;
	const token = ++runToken;
	const seriesId = appState.currentSeries || 'root';
	try {
		const identity = await loadIdentity();
		if (token !== runToken) return;
		const aliases = Array.isArray(identity?.aliases) ? identity.aliases : [];
		if (!identity?.loggedIn || !aliases.length) {
			applyState(element, {
				state: 'signin',
				label: 'Sign in to add',
				href: `/login/?return=${encodeURIComponent(location.pathname + location.search)}`,
				title: 'Sign in, and you will return to this Heichel.'
			});
			return;
		}
		const selectedAlias = identity.selectedAlias
			|| identity.defaultAlias
			|| aliases[0].aliasId;
		const detail = await loadDetail(heichelId, seriesId, selectedAlias);
		if (token !== runToken || !detail) return;
		let ownerAlias = detail?.heichel?.ownerAlias || detail?.access?.ownerAlias || '';
		if (!ownerAlias) ownerAlias = await probeOwnerAlias(heichelId, aliases);
		if (token !== runToken) return;
		const inSeries = seriesId !== 'root';
		if (ownerAlias && aliases.some(alias => alias.aliasId === ownerAlias)) {
			applyState(element, {
				state: 'owner',
				label: inSeries ? '＋ Add to this series' : '＋ Add a post',
				href: composerHref({ heichelId, seriesId, aliasId: ownerAlias }),
				title: `Posting as ${ownerAlias}, the owner of this Heichel.`
			});
			return;
		}
		const mode = detail?.access?.actions?.content?.mode || '';
		if (mode === 'direct') {
			applyState(element, {
				state: 'owner',
				label: inSeries ? '＋ Add to this series' : '＋ Add a post',
				href: composerHref({ heichelId, seriesId, aliasId: selectedAlias }),
				title: 'You may publish directly to this Heichel.'
			});
			return;
		}
		if (mode === 'submit') {
			applyState(element, {
				state: 'contributor',
				label: 'Submit for review',
				href: composerHref({ heichelId, seriesId, aliasId: selectedAlias }),
				title: 'Your post goes to this Heichel’s moderators for review before it appears.'
			});
			return;
		}
		if (mode === 'deny') {
			// Signed in, but this house accepts nothing from this alias:
			// no control at all is more honest than a dead one.
			element.hidden = true;
			element.dataset.state = 'closed';
		}
	} catch {
		/* keep the blueprint's generic deep link — see module note */
	}
}
