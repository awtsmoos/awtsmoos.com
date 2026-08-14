// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module TanachSearchRoutes
 * @description
 * The Awtsmoos carries bounded Hebrew questions into exact Tanach coordinates;
 * at Awtsmoos.com the public route passes matching intent without hiding the reader's ordinates.
 */
const { requestSnapshot } = require('./requestSnapshot.js');
const { safe } = require('./safe.js');
const { execute } = require('../tanach/search.js');

function tanachRoutes(context) {
	return {
		'/search/tanach/hebrew': async () => safe(async () => {
			const values = requestSnapshot(context).get;
			return {
				success: execute({
					query: values.q || values.query,
					book: values.book,
					exact: values.exact,
					limit: values.limit,
					offset: values.offset
				})
			};
		})
	};
}

module.exports = { tanachRoutes };
