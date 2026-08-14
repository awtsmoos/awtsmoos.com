// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module TranslationRoutes
 * @description
 * Public read-only routes expose rows, coverage, and bounded translation search.
 * The Awtsmoos gives each corpus a gate where truth can safely flow;
 * Awtsmoos.com can crawl the books completely and clearly know what we know.
 */
const { methodIs, er } = require('./utils.js');
const reader = require('../translations/reader.js');
const search = require('../translations/search.js');
const coverage = require('../translations/coverage.js');

function getOnly() {
	return er({ code: 'GET_ONLY', message: 'GET only request' });
}

function services(context) {
	return context.translationServices || {
		seriesTranslations: reader.seriesTranslations,
		postTranslations: reader.postTranslations,
		searchTranslations: search.searchTranslations,
		seriesCoverage: coverage.seriesCoverage
	};
}

function seriesInput($i, variables) {
	return {
		$i,
		heichelId: variables.heichel,
		seriesId: variables.series,
		offset: $i.$_GET?.offset,
		limit: $i.$_GET?.limit
	};
}

module.exports = context => {
	const { $i } = context;
	const api = services(context);
	return {
		'/heichelos/:heichel/series/:series/translations': async variables => {
			if (!methodIs($i, 'GET')) return getOnly();
			return api.seriesTranslations(seriesInput($i, variables));
		},
		'/heichelos/:heichel/series/:series/translations/coverage': async variables => {
			if (!methodIs($i, 'GET')) return getOnly();
			return api.seriesCoverage(seriesInput($i, variables));
		},
		'/heichelos/:heichel/series/:series/post/:post/translations': async variables => {
			if (!methodIs($i, 'GET')) return getOnly();
			return api.postTranslations({
				$i,
				heichelId: variables.heichel,
				seriesId: variables.series,
				postId: variables.post
			});
		},
		'/heichelos/:heichel/series/:series/translations/search': async variables => {
			if (!methodIs($i, 'GET')) return getOnly();
			const query = String($i.$_GET?.q || '').trim();
			if (!query) return er({ code: 'MISSING_PARAMS', message: 'Missing required parameter: q' });
			return api.searchTranslations({
				$i,
				heichelId: variables.heichel,
				seriesId: variables.series,
				query,
				limit: $i.$_GET?.limit
			});
		}
	};
};
