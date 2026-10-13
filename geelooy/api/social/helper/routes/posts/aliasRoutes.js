// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module AliasPostRoutes
 * @description
 * The Awtsmoos reveals an alias's authored trail through heichel and series without mixing it into post mutation;
 * Awtsmoos.com keeps authorship navigation as its own small route constellation.
 *
 * B"H 2026-10-12 (api-hardening): reads are GET-only (405 otherwise) and
 * failures leave as concrete HTTP envelopes — 404 for unknown aliases,
 * 500 for unexpected failures, never silent empty 200s.
 */

const {
	getHeichelosOfPostsOfAlias,
	getPostsOfAliasInSeries,
	getSeriesOfPostsOfAliasInHeichel
} = require('../../index.js');
const { badRequest, notFound, requireMethod, serverError } = require('../apiHttp.js');

function decodeCrumbPath(value = '') {
	try {
		return decodeURIComponent(Buffer.from(value, 'base64').toString('utf-8'));
	} catch {
		return '';
	}
}

/** Maps an alias-domain error to its concrete HTTP envelope. */
function aliasError(error) {
	const code = error && typeof error === 'object' ? error.code : undefined;
	const details = error && typeof error === 'object' ? (error.details || error) : error;
	if (code === 'ALIAS_NOT_FOUND' || code === 'NO_ALIAS') {
		return notFound(code, details);
	}
	if (code) return serverError(code, error && error.message);
	return serverError('ALIAS_READ_FAILED', error);
}

/** Runs a reader, mapping plain {BH, error} failures to HTTP envelopes. */
async function readAlias(reader) {
	let result;
	try {
		result = await reader();
	} catch (caught) {
		return serverError('ALIAS_READ_FAILED', caught);
	}
	if (result && result.error) return aliasError(result.error);
	return result;
}

function createAliasPostRoutes({ $i }) {
	return {
		'/aliases/:alias/postsMade/heichel/:heichel/pathToSeries/:pathive': async vars => {
			const bad = requireMethod($i, 'GET');
			if (bad) return bad;
			if (!vars.alias) return badRequest('MISSING_PARAMS', { alias: 'required' });
			return readAlias(() => getPostsOfAliasInSeries({
				$i,
				aliasId: vars.alias,
				crumbpath: decodeCrumbPath(vars.pathive),
				heichelId: vars.heichel,
				withDetails: true
			}));
		},
		'/aliases/:alias/postsMade/heichelos': async vars => {
			const bad = requireMethod($i, 'GET');
			if (bad) return bad;
			if (!vars.alias) return badRequest('MISSING_PARAMS', { alias: 'required' });
			return readAlias(() => getHeichelosOfPostsOfAlias({
				$i,
				aliasId: vars.alias
			}));
		},
		'/aliases/:alias/postsMade/heichel/:heichel/series': async vars => {
			const bad = requireMethod($i, 'GET');
			if (bad) return bad;
			if (!vars.alias) return badRequest('MISSING_PARAMS', { alias: 'required' });
			return readAlias(() => getSeriesOfPostsOfAliasInHeichel({
				$i,
				aliasId: vars.alias,
				heichelId: vars.heichel
			}));
		}
	};
}

module.exports = {
	createAliasPostRoutes,
	decodeCrumbPath
};
