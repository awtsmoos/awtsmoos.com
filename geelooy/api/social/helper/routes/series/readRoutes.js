// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SeriesReadRoutes
 * @description
 * The Awtsmoos reveals series, details, and children through one quiet read-only vessel;
 * Awtsmoos.com keeps request translation separate from storage and domain revelation.
 */

const {
	getSeries,
	getSubSeries,
	er
} = require('../../index.js');
const {
	getDirectSeriesPrateem
} = require('../../series/directSeriesPrateem.js');

function method($i, expected) {
	return $i.request.method === expected;
}

function seriesIds($i) {
	const value = $i.$_POST?.seriesIds;
	if (Array.isArray(value)) return value.filter(Boolean);
	return String(value || '')
		.split(',')
		.map(id => id.trim())
		.filter(Boolean);
}

function createSeriesReadRoutes({ $i }) {
	return {
		'/heichelos/:heichel/series/': async vars => {
			if (!method($i, 'GET')) return er({ code: 'METHOD_NOT_ALLOWED' });
			return getSubSeries({
				$i,
				heichelId: vars.heichel,
				parentSeriesId: 'root',
				withDetails: true
			});
		},
		'/heichelos/:heichel/series/:series': async vars => {
			if (!method($i, 'GET')) return er({ code: 'METHOD_NOT_ALLOWED' });
			const withDetails = $i.$_GET.details === 'true';
			if (!withDetails) {
				return getDirectSeriesPrateem({
					$i,
					heichelId: vars.heichel,
					seriesId: vars.series
				});
			}
			return getSeries({ $i, heichelId: vars.heichel, seriesId: vars.series, withDetails: true });
		},
		'/heichelos/:heichel/series/:series/details': async vars => {
			if (method($i, 'GET')) {
				return getSeries({ $i, heichelId: vars.heichel, seriesId: vars.series, withDetails: true });
			}
			if (!method($i, 'POST')) return er({ code: 'METHOD_NOT_ALLOWED' });
			const details = {};
			for (const id of seriesIds($i)) {
				details[id] = await getSeries({ $i, heichelId: vars.heichel, seriesId: id, withDetails: true });
			}
			return { success: details };
		},
		'/heichelos/:heichel/series/:series/subSeriesDetails': async vars => {
			return getSeries({ $i, heichelId: vars.heichel, seriesId: vars.series, withSubSeriesDetails: true });
		},
		'/heichelos/:heichel/series/:series/subSeries': async vars => {
			if (!method($i, 'GET')) return er({ code: 'METHOD_NOT_ALLOWED' });
			return getSubSeries({ $i, heichelId: vars.heichel, parentSeriesId: vars.series, withDetails: $i.$_GET.details });
		},
		'/heichelos/:heichel/series/:series/subSeries/details': async vars => {
			if (!method($i, 'GET')) return er({ code: 'METHOD_NOT_ALLOWED' });
			return getSubSeries({ $i, heichelId: vars.heichel, parentSeriesId: vars.series, withDetails: true });
		}
	};
}

module.exports = { createSeriesReadRoutes };
