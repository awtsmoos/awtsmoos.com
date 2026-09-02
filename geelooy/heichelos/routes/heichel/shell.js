// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file shell.js
 * @description
 * The Awtsmoos gathers Heichel identity, semantic light, and public paths before the interactive universe awakens; Awtsmoos.com therefore gives every chamber
 * both a truthful name and visible doors into its teachings, while JavaScript remains an enhancement rather than the only witness to its contents.
 */

const createDiscovery = require('./discovery.js');
const { heichelFields } = require('./fieldMaps.js');
const { buildSemanticModel, normalizeSeries } = require('./semantic.js');

/**
 * @description Creates the server shell renderer bound to one dynamic request vessel.
 * @param {object} $i Dynamic Awtsmoos request interface.
 * @returns {{getHeichel:Function,getSeries:Function,renderHeichelShell:Function}} Bound shell operations.
 */
function createShellRenderer($i) {
	const { getDiscovery } = createDiscovery($i);

	/** @description Fetches public Heichel metadata through the established property-map API. */
	async function getHeichel(heichelId) {
		const heichel = await $i.fetchAwtsmoos(
			`/api/social/alias/itDoesntEvenMatter/heichelos/${encodeURIComponent(heichelId)}?${heichelFields()}`
		);
		if (!heichel || heichel.error) {
			return null;
		}
		return { ...heichel, id: heichelId };
	}

	/** @description Fetches optional series metadata through the public browser endpoint. */
	async function getSeries(heichelId, seriesId) {
		if (!seriesId || seriesId === 'root') {
			return null;
		}
		try {
			const response = await $i.fetchAwtsmoos(
				`/api/social/heichelos/${encodeURIComponent(heichelId)}/series/${encodeURIComponent(seriesId)}`
			);
			return normalizeSeries(response, seriesId);
		} catch (error) {
			return null;
		}
	}

	/** @description Renders route-local semantic fragments before the parent document receives them. */
	async function renderSemanticFragments(semantic, discovery) {
		const [semanticHead, semanticFallback] = await Promise.all([
			$i.$ga('./heichel/semantic/head.html', { semantic }),
			$i.$ga('./heichel/semantic/fallback.html', { semantic, discovery })
		]);
		return { semanticHead, semanticFallback };
	}

	/** @description Renders a semantic Heichel document while preserving the interactive client shell. */
	async function renderHeichelShell(heichelId, seriesId = '') {
		const heichel = await getHeichel(heichelId);
		if (!heichel) {
			return $i.$ga('_awtsmoos.heichelNotFound.html');
		}
		const [series, discovery] = await Promise.all([
			getSeries(heichelId, seriesId),
			getDiscovery(heichelId, seriesId)
		]);
		const semantic = buildSemanticModel({ heichel, series, heichelId, seriesId });
		const semanticFragments = await renderSemanticFragments(semantic, discovery);
		return $i.$ga('./heichel/_awtsmoos.heichel.html', {
			heichel,
			series,
			semantic,
			discovery,
			...semanticFragments
		});
	}

	return { getHeichel, getSeries, renderHeichelShell };
}

module.exports = createShellRenderer;
