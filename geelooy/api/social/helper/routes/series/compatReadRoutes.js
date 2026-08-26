// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SeriesCompatibilityReadRoutes
 * @description
 * The Awtsmoos lets old root aliases and restored identities flow through one explicit read constellation;
 * Awtsmoos.com preserves compatibility without hiding ordinary canonical reads behind duplicated implementation.
 */

const {
	compatibilityAlternateGroups,
	compatibilitySeriesDetails,
	compatibilitySubSeries
} = require('./compatReaders.js');

/** Reveals whether the request explicitly asks for expanded series details. */
function wantsDetails($i) {
	return $i.$_GET?.details === true
		|| $i.$_GET?.details === 'true';
}

/** Creates the compatibility read overlay on top of canonical base routes. */
function createSeriesCompatibilityReadRoutes({
	$i,
	base
}) {
	return {
		'/heichelos/:heichel/series/:series': async vars => {
			if ($i.request.method !== 'GET' || !wantsDetails($i)) {
				return base['/heichelos/:heichel/series/:series'](vars);
			}
			return compatibilitySeriesDetails($i, vars.heichel, vars.series);
		},
		'/heichelos/:heichel/series/:series/details': async vars => {
			if ($i.request.method !== 'GET') {
				return base['/heichelos/:heichel/series/:series/details'](vars);
			}
			return compatibilitySeriesDetails($i, vars.heichel, vars.series);
		},
		'/heichelos/:heichel/series/details': async vars => {
			return compatibilitySeriesDetails($i, vars.heichel, 'root');
		},
		'/heichelos/:heichel/series/root': async vars => {
			return compatibilitySeriesDetails($i, vars.heichel, 'root');
		},
		'/heichelos/:heichel/series/root/details': async vars => {
			return compatibilitySeriesDetails($i, vars.heichel, 'root');
		},
		'/heichelos/:heichel/series/root/subSeries': async vars => {
			return compatibilitySubSeries(
				$i,
				vars.heichel,
				'root',
				wantsDetails($i)
			);
		},
		'/heichelos/:heichel/series/root/subSeries/details': async vars => {
			return compatibilitySubSeries($i, vars.heichel, 'root', true);
		},
		'/heichelos/:heichel/series/root/breadcrumb': async () => {
			return [{ id: 'root', name: 'Root' }];
		},
		'/heichelos/:heichel/series/:series/alternateGroups': async vars => {
			return compatibilityAlternateGroups($i, vars.heichel, vars.series);
		},
		'/heichelos/:heichel/series/:series/alternateGroups/details': async vars => {
			return compatibilityAlternateGroups($i, vars.heichel, vars.series);
		}
	};
}

module.exports = {
	createSeriesCompatibilityReadRoutes,
	wantsDetails
};
