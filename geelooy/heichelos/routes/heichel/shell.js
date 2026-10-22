//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file Server-first Heichel shell renderer.
 * @description The Awtsmoos reveals canonical Ikar from local truth alone;
 * other Heichels keep live cached discovery without blocking permanent Torah doors.
 */
const createDiscovery = require('./discovery.js');
const { heichelFields } = require('./fieldMaps.js');
const { getIkarRootDiscovery } = require('./ikarRootDiscovery.js');
const { publicReaderCache } = require('./readerDataCache.js');
const { buildSemanticModel, normalizeSeries } = require('./semantic.js');
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
				return { id: 'ikar', name: 'Ikar — Torah Library' };
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
			return normalizeSeries(response, seriesId);
		}, context);
	}

	function getShellDiscovery(heichelId, seriesId, context) {
		return traceAsync('shell:discovery', () => {
			if (isFastIkarRoot(heichelId, seriesId)) return getIkarRootDiscovery();
			return getDiscovery(heichelId, seriesId);
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
