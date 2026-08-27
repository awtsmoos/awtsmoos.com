// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module LegacyPostCommentRoutes
 * @description Public legacy route names bound to dedicated rich-comment operations.
 */
const { er, methodIs } = require('./utils.js');
const read = require('./postReadOperations.js');
const mutation = require('./postMutationOperations.js');

module.exports = function postCommentRoutes({ $i, userid }) {
	async function seriesAliasSections(vars) {
		if (!methodIs($i, 'GET')) {
			return er({ message: 'GET only request', code: 'GET_ONLY' });
		}
		return read.aliasSections($i, vars, vars.alias, vars.series);
	}

	async function seriesAliasComments(vars) {
		if (!methodIs($i, 'GET')) {
			return er({ message: 'GET only request', code: 'GET_ONLY' });
		}
		return read.aliasComments($i, vars, vars.alias, vars.series);
	}

	async function seriesAliases(vars) {
		if (!methodIs($i, 'GET')) {
			return er({ message: 'GET only request', code: 'GET_ONLY' });
		}
		return read.aliases($i, vars, vars.series);
	}

	async function rootAliases(vars) {
		if (!methodIs($i, 'GET')) {
			return er({ message: 'Method Not Allowed', code: 405 });
		}
		return read.aliases($i, vars);
	}

	async function rootCollection(vars) {
		return mutation.collection($i, userid, vars);
	}

	async function aliasFacade(vars) {
		return mutation.aliasFacade($i, userid, vars);
	}

	async function oldSeriesAlias(vars) {
		if (!methodIs($i, 'GET')) {
			return er({ message: 'GET only request', code: 'GET_ONLY' });
		}
		return read.aliasComments($i, vars, vars.alias, vars.series);
	}

	return {
		'/heichelos/:heichel/series/:series/post/:post/comments/aliases/:alias/sections': seriesAliasSections,
		'/heichelos/:heichel/series/:series/post/:post/comments/aliases/:alias': seriesAliasComments,
		'/heichelos/:heichel/series/:series/post/:post/comments/aliases': seriesAliases,
		'/heichelos/:heichel/post/:post/comments/aliases': rootAliases,
		'/heichelos/:heichel/post/:post/comments/': rootCollection,
		'/heichelos/:heichel/post/:post/comments/aliases/:alias': aliasFacade,
		'/heichelos/:heichel/comments/inSeries/:series/atPost/:post/atAlias/:alias': oldSeriesAlias
	};
};

module.exports.seriesFrom = read.seriesFrom;
