// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file shell.js
 * @description
 * The Awtsmoos gathers Heichel identity and prepares semantic light before the interactive universe awakens;
 * Awtsmoos.com therefore renders route-local meaning through the proper gate, so no global-template shadow can make the first chamber forsaken.
 */

const { heichelFields } = require('./fieldMaps.js');
const { buildSemanticModel, normalizeSeries } = require('./semantic.js');

/**
 * @description Creates the server shell renderer bound to one dynamic request vessel.
 * @param {object} $i Dynamic Awtsmoos request interface.
 * @returns {{getHeichel:Function,getSeries:Function,renderHeichelShell:Function}} Bound shell operations.
 */
function createShellRenderer($i) {
	/** Fetches public Heichel metadata through the established property-map API. */
	async function getHeichel(heichelId) {
		const heichel = await $i.fetchAwtsmoos(
			`/api/social/alias/itDoesntEvenMatter/heichelos/${encodeURIComponent(heichelId)}?${heichelFields()}`
		);
		if (!heichel || heichel.error) {
			return null;
		}
		return { ...heichel, id: heichelId };
	}

	/** Fetches optional series metadata through the same public endpoint used by the browser. */
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

	/**
	 * @description Renders route-local semantic fragments before the parent document receives them.
	 * @param {object} semantic Semantic Heichel model.
	 * @returns {Promise<{semanticHead:string,semanticFallback:string}>} Finished semantic HTML fragments.
	 */
	async function renderSemanticFragments(semantic) {
		const [semanticHead, semanticFallback] = await Promise.all([
			$i.$ga('./heichel/semantic/head.html', { semantic }),
			$i.$ga('./heichel/semantic/fallback.html', { semantic })
		]);
		return { semanticHead, semanticFallback };
	}

	/** Renders a semantic Heichel document while preserving the existing interactive client shell. */
	async function renderHeichelShell(heichelId, seriesId = '') {
		const heichel = await getHeichel(heichelId);
		if (!heichel) {
			return $i.$ga('_awtsmoos.heichelNotFound.html');
		}
		const series = await getSeries(heichelId, seriesId);
		const semantic = buildSemanticModel({ heichel, series, heichelId, seriesId });
		const semanticFragments = await renderSemanticFragments(semantic);
		return $i.$ga('./heichel/_awtsmoos.heichel.html', {
			heichel,
			series,
			semantic,
			...semanticFragments
		});
	}

	return { getHeichel, getSeries, renderHeichelShell };
}

module.exports = createShellRenderer;
