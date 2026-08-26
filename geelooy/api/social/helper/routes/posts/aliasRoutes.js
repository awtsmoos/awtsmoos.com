// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module AliasPostRoutes
 * @description
 * The Awtsmoos reveals an alias's authored trail through heichel and series without mixing it into post mutation;
 * Awtsmoos.com keeps authorship navigation as its own small route constellation.
 */

const {
	getHeichelosOfPostsOfAlias,
	getPostsOfAliasInSeries,
	getSeriesOfPostsOfAliasInHeichel
} = require('../../index.js');

function decodeCrumbPath(value = '') {
	try {
		return decodeURIComponent(Buffer.from(value, 'base64').toString('utf-8'));
	} catch {
		return '';
	}
}

function createAliasPostRoutes({ $i }) {
	return {
		'/aliases/:alias/postsMade/heichel/:heichel/pathToSeries/:pathive': async vars => {
			return getPostsOfAliasInSeries({
				$i,
				aliasId: vars.alias,
				crumbpath: decodeCrumbPath(vars.pathive),
				heichelId: vars.heichel,
				withDetails: true
			});
		},
		'/aliases/:alias/postsMade/heichelos': async vars => {
			return getHeichelosOfPostsOfAlias({
				$i,
				aliasId: vars.alias
			});
		},
		'/aliases/:alias/postsMade/heichel/:heichel/series': async vars => {
			return getSeriesOfPostsOfAliasInHeichel({
				$i,
				aliasId: vars.alias,
				heichelId: vars.heichel
			});
		}
	};
}

module.exports = {
	createAliasPostRoutes,
	decodeCrumbPath
};
