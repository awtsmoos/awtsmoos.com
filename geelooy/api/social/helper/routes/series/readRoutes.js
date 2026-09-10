//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module SeriesReadRoutes
 * @description
 * The Awtsmoos reveals series identity and child summaries through bounded
 * server vessels so Awtsmoos.com never makes the browser rediscover one tree.
 */
const {
	getSeries,
	getSubSeries,
	er
} = require('../../index.js');
const {
	getDirectSeriesPrateem
} = require('../../series/directSeriesPrateem.js');
const {
	readSubSeriesSummaries
} = require('./subSeriesSummaries.js');
/** Returns whether this request uses the expected HTTP method. */
function method($i, expected) {
	return $i.request.method === expected;
}
/** Normalizes a details query value into one strict Boolean decision. */
function wantsDetails($i) {
	return $i.$_GET?.details === true || $i.$_GET?.details === 'true';
}

/** Returns render-ready children only when the caller explicitly requests details. */
function readChildren($i, heichelId, parentSeriesId, detailed) {
	if (detailed) {
		return readSubSeriesSummaries({
			$i,
			heichelId,
			parentSeriesId
		});
	}
	return getSubSeries({
		$i,
		heichelId,
		parentSeriesId,
		withDetails: false
	});
}
/** Normalizes POSTed bulk series identities without accepting empty values. */
function seriesIds($i) {
	const value = $i.$_POST?.seriesIds;
	if (Array.isArray(value)) return value.filter(Boolean);
	return String(value || '')
		.split(',')
		.map(id => id.trim())
		.filter(Boolean);
}
/** Creates the stable read-only series route table for one request. */
function createSeriesReadRoutes({ $i }) {
	return {
		'/heichelos/:heichel/series/': async vars => {
			if (!method($i, 'GET')) return er({ code: 'METHOD_NOT_ALLOWED' });
			return readChildren($i, vars.heichel, 'root', true);
		},
		'/heichelos/:heichel/series/:series': async vars => {
			if (!method($i, 'GET')) return er({ code: 'METHOD_NOT_ALLOWED' });
			if (!wantsDetails($i)) {
				return getDirectSeriesPrateem({
					$i,
					heichelId: vars.heichel,
					seriesId: vars.series
				});
			}
			return getSeries({
				$i,
				heichelId: vars.heichel,
				seriesId: vars.series,
				withDetails: true
			});
		},
		'/heichelos/:heichel/series/:series/details': async vars => {
			if (method($i, 'GET')) {
				return getSeries({
					$i,
					heichelId: vars.heichel,
					seriesId: vars.series,
					withDetails: true
				});
			}
			if (!method($i, 'POST')) return er({ code: 'METHOD_NOT_ALLOWED' });
			const details = {};
			for (const id of seriesIds($i)) {
				details[id] = await getSeries({
					$i,
					heichelId: vars.heichel,
					seriesId: id,
					withDetails: true
				});
			}
			return { success: details };
		},
		'/heichelos/:heichel/series/:series/subSeriesDetails': async vars => {
			return readChildren($i, vars.heichel, vars.series, true);
		},
		'/heichelos/:heichel/series/:series/subSeries': async vars => {
			if (!method($i, 'GET')) return er({ code: 'METHOD_NOT_ALLOWED' });
			return readChildren(
				$i,
				vars.heichel,
				vars.series,
				wantsDetails($i)
			);
		},
		'/heichelos/:heichel/series/:series/subSeries/details': async vars => {
			if (!method($i, 'GET')) return er({ code: 'METHOD_NOT_ALLOWED' });
			return readChildren($i, vars.heichel, vars.series, true);
		}
	};
}
module.exports = {
	createSeriesReadRoutes
};
