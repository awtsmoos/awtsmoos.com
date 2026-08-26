// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SeriesNavigationRoutes
 * @description
 * The Awtsmoos gives parent, breadcrumb, and property navigation their own coherent path;
 * Awtsmoos.com keeps traversal concerns outside ordinary detail reads and mutation wrath.
 */

const {
	getSeries,
	getSeriesByProperty,
	er
} = require('../../index.js');
const { seriesBreadcrumb } = require('./breadcrumb.js');

function decode(value) {
	try {
		return decodeURIComponent(value || '');
	} catch {
		return value || '';
	}
}

function createSeriesNavigationRoutes({ $i }) {
	return {
		'/heichelos/:heichel/series/:series/parent': async vars => {
			if ($i.request.method !== 'GET') return er({ code: 'METHOD_NOT_ALLOWED' });
			const current = await getSeries({
				$i,
				heichelId: vars.heichel,
				seriesId: vars.series,
				properties: { parentSeriesId: true }
			});
			if (current?.error) return current;
			const parentId = current?.prateem?.parentSeriesId;
			if (!parentId || parentId === 'root') {
				return { prateem: { id: 'root', name: 'Root', isRoot: true } };
			}
			return getSeries({ $i, heichelId: vars.heichel, seriesId: parentId, withDetails: false });
		},
		'/heichelos/:heichel/series/:series/breadcrumb': async vars => {
			if ($i.request.method !== 'GET') return er({ code: 'METHOD_NOT_ALLOWED' });
			return seriesBreadcrumb({ $i, heichelId: vars.heichel, seriesId: vars.series });
		},
		'/heichelos/:heichel/series/:series/filterSeriesBy/:propKey/:propVal': async vars => {
			if ($i.request.method !== 'GET') return er({ code: 'METHOD_NOT_ALLOWED' });
			return getSeriesByProperty({
				$i,
				heichelId: vars.heichel,
				parentSeriesId: vars.series,
				propertyKey: decode(vars.propKey),
				propertyValue: decode(vars.propVal)
			});
		}
	};
}

module.exports = { createSeriesNavigationRoutes };
