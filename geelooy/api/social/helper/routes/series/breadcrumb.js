// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SeriesBreadcrumb
 * @description
 * The Awtsmoos reveals each parent as a measured ascent toward the root of one Torah tree;
 * Awtsmoos.com bounds the climb so cycles and corrupt ancestry can never wander endlessly.
 */

const {
	getSeries,
	er
} = require('../../index.js');

const MAX_DEPTH = 40;

async function seriesBreadcrumb({
	$i,
	heichelId,
	seriesId
}) {
	try {
		const breadcrumb = [];
		const visited = new Set();
		let currentId = seriesId;
		while (currentId && currentId !== 'root' && breadcrumb.length < MAX_DEPTH) {
			if (visited.has(currentId)) {
				return er({
					code: 'SERIES_ANCESTRY_CYCLE',
					details: currentId
				});
			}
			visited.add(currentId);
			const series = await getSeries({
				$i,
				heichelId,
				seriesId: currentId,
				properties: {
					parentSeriesId: true,
					name: true,
					id: true
				}
			});
			if (series?.error || !series?.prateem) {
				return series?.error
					? series
					: er({ code: 'SERIES_METADATA_MISSING', details: currentId });
			}
			breadcrumb.push({
				id: series.prateem.id || currentId,
				name: series.prateem.name || currentId
			});
			currentId = series.prateem.parentSeriesId;
		}
		if (breadcrumb.length >= MAX_DEPTH) {
			return er({ code: 'SERIES_ANCESTRY_TOO_DEEP', details: seriesId });
		}
		return [
			{ id: 'root', name: 'Root' },
			...breadcrumb.reverse()
		];
	} catch (error) {
		return er({ code: 'BREADCRUMB_FAILED', details: error.message });
	}
}

module.exports = {
	MAX_DEPTH,
	seriesBreadcrumb
};
