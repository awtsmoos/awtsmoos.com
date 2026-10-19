//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file shell.js
 * @description
 * The Awtsmoos gathers Heichel identity, discovery, and semantic light before the browser wakes;
 * Awtsmoos.com times each cold vessel only when asked, so hidden delay becomes truth without changing what the learner takes.
 */

const createDiscovery = require('./discovery.js');
const { heichelFields } = require('./fieldMaps.js');
const { buildSemanticModel, normalizeSeries } = require('./semantic.js');
const { traceAsync } = require('./torahRouteTrace.js');

/** Creates the server shell renderer bound to one dynamic request vessel. */
function createShellRenderer($i) {
	const { getDiscovery } = createDiscovery($i);

	/** Fetches public Heichel metadata through the established property-map API. */
	async function getHeichel(heichelId, context) {
		return traceAsync('shell:heichel', async () => {
			const heichel = await $i.fetchAwtsmoos(
				`/api/social/alias/itDoesntEvenMatter/heichelos/${encodeURIComponent(heichelId)}?${heichelFields()}`
			);
			return !heichel || heichel.error ? null : { ...heichel, id: heichelId };
		}, context);
	}

	/** Fetches optional series metadata through the public browser endpoint. */
	async function getSeries(heichelId, seriesId, context) {
		if (!seriesId || seriesId === 'root') {
			return null;
		}
		return traceAsync('shell:series', async () => {
			try {
				const response = await $i.fetchAwtsmoos(
					`/api/social/heichelos/${encodeURIComponent(heichelId)}/series/${encodeURIComponent(seriesId)}`
				);
				return normalizeSeries(response, seriesId);
			} catch {
				return null;
			}
		}, context);
	}

	/** Renders route-local semantic fragments before the parent document receives them. */
	async function renderSemanticFragments(semantic, discovery, context) {
		return traceAsync('shell:semantic-fragments', async () => {
			const [semanticHead, semanticFallback] = await Promise.all([
				$i.$ga('./heichel/semantic/head.html', { semantic }),
				$i.$ga('./heichel/semantic/fallback.html', { semantic, discovery })
			]);
			return { semanticHead, semanticFallback };
		}, context);
	}

	/** Renders a semantic Heichel document while preserving the interactive client shell. */
	async function renderHeichelShell(heichelId, seriesId = '') {
		const context = { heichelId, seriesId: seriesId || 'root' };
		return traceAsync('shell:total', async () => {
			const heichel = await getHeichel(heichelId, context);
			if (!heichel) {
				return $i.$ga('_awtsmoos.heichelNotFound.html');
			}
			const [series, discovery] = await Promise.all([
				getSeries(heichelId, seriesId, context),
				traceAsync('shell:discovery', () => getDiscovery(heichelId, seriesId), context)
			]);
			const semantic = await traceAsync(
				'shell:semantic',
				() => buildSemanticModel({ heichel, series, heichelId, seriesId }),
				context
			);
			const fragments = await renderSemanticFragments(semantic, discovery, context);
			return traceAsync('shell:final-template', () => $i.$ga('./heichel/_awtsmoos.heichel.html', {
				heichel,
				series,
				semantic,
				discovery,
				...fragments
			}), context);
		}, context);
	}

	return { getHeichel, getSeries, renderHeichelShell };
}

module.exports = createShellRenderer;
