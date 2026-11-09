//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file Server-first Heichel shell renderer.
 * @description The Awtsmoos reveals canonical Ikar from local truth alone;
 * Awtsmoos.com keeps live discovery and special Torah doors useful before enhancement wakes.
 */
const createDiscovery = require('./discovery.js');
const { heichelFields } = require('./fieldMaps.js');
const { getIkarRootDiscovery } = require('./ikarRootDiscovery.js');
const { publicReaderCache } = require('./readerDataCache.js');
const { buildSemanticModel, normalizeSeries } = require('./semantic.js');
const { getSpecialTorahDiscovery } = require('./specialTorahDiscovery.js');
const { traceAsync } = require('./torahRouteTrace.js');

function isFastIkarRoot(heichelId, seriesId) {
	return heichelId === 'ikar' && (!seriesId || seriesId === 'root');
}

function createShellRenderer($i) {
	const { getDiscovery } = createDiscovery($i);

	async function cachedPublic(path) {
		return publicReaderCache.read(`shell:${path}`, async () => {
			const response = await $i.fetchAwtsmoos(path);
			return response && !response.error ? response : null;
		});
	}

	async function getHeichel(heichelId, seriesId, context) {
		return traceAsync('shell:heichel', async () => {
			if (isFastIkarRoot(heichelId, seriesId)) {
				// B"H 2026-11-09: the stored ikar record carries no description,
				// so the hero fell back to generic copy. State the true shape
				// of this page instead: nine section cards, not a count of
				// heichelos. (Live verification 2026-11-09: the whole Living
				// Library holds 8 public heichelos — discover API total 8,
				// heichel sitemap 8 — and this page lists Ikar's 9 sections.
				// No "18 heichelos" string exists anywhere in the code, the
				// served HTML, or git history; there is nothing to correct
				// except stating the true number here.)
				return {
					id: 'ikar',
					name: 'Ikar — Torah Library',
					description: 'The Entire Torah in nine sections — open a section to begin learning.'
				};
			}
			const path = `/api/social/alias/itDoesntEvenMatter/heichelos/${encodeURIComponent(heichelId)}?${heichelFields()}`;
			const heichel = await cachedPublic(path).catch(() => null);
			return heichel ? { ...heichel, id: heichelId } : null;
		}, context);
	}

	async function getSeries(heichelId, seriesId, context) {
		if (!seriesId || seriesId === 'root') return null;
		return traceAsync('shell:series', async () => {
			const path = `/api/social/heichelos/${encodeURIComponent(heichelId)}/series/${encodeURIComponent(seriesId)}`;
			const response = await cachedPublic(path).catch(() => null);
			const series = normalizeSeries(response, seriesId);
			if (series && heichelId === 'ikar' && seriesId === 'midrash') {
				// B"H 2026-11-09: the stored midrash prateem still promises
				// "Midrash Rabbah and its commentaries", but the library holds
				// exactly one section — Rashi on Bereshit Rabbah, 20 posts
				// (packed ∪ native exact union, verified 2026-11-09). The 14
				// other midrash-* native dirs hold only a 1-byte placeholder
				// and zero posts, so they are not listed either. Correct the
				// copy at render until the stored prateem is fixed.
				series.description = 'Midrashic literature — Rashi on Bereshit Rabbah (Midrash Rabbah on Genesis).';
			}
			return series;
		}, context);
	}

	function getShellDiscovery(heichelId, seriesId, context) {
		return traceAsync('shell:discovery', async () => {
			if (isFastIkarRoot(heichelId, seriesId)) return getIkarRootDiscovery();
			const special = await getSpecialTorahDiscovery($i, heichelId, seriesId);
			return special || getDiscovery(heichelId, seriesId);
		}, context);
	}

	async function renderSemanticFragments(semantic, discovery, series, context) {
		return traceAsync('shell:semantic-fragments', async () => {
			const [semanticHead, semanticFallback] = await Promise.all([
				$i.$ga('./heichel/semantic/head.html', { semantic }),
				$i.$ga('./heichel/semantic/fallback.html', { semantic, discovery, series })
			]);
			return { semanticHead, semanticFallback };
		}, context);
	}

	async function renderHeichelShell(heichelId, seriesId = '') {
		const context = { heichelId, seriesId: seriesId || 'root' };
		return traceAsync('shell:total', async () => {
			const [heichel, series, discovery] = await Promise.all([
				getHeichel(heichelId, seriesId, context),
				getSeries(heichelId, seriesId, context),
				getShellDiscovery(heichelId, seriesId, context)
			]);
			if (!heichel) return $i.$ga('_awtsmoos.heichelNotFound.html');
			const semantic = await traceAsync(
				'shell:semantic',
				() => buildSemanticModel({ heichel, series, heichelId, seriesId }),
				context
			);
			const fragments = await renderSemanticFragments(semantic, discovery, series, context);
			return traceAsync('shell:final-template', () => $i.$ga('./heichel/_awtsmoos.heichel.html', {
				heichel,
				series,
				semantic,
				discovery,
				isIkarRoot: isFastIkarRoot(heichelId, seriesId),
				isSeriesPage: Boolean(seriesId && seriesId !== 'root'),
				...fragments
			}), context);
		}, context);
	}

	return { getHeichel, getSeries, renderHeichelShell };
}

module.exports = createShellRenderer;
