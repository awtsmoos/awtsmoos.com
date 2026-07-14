// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ExactSearchRoutes
 * @description
 * Exact Hebrew lookup remains a small, bounded route family beside library search.
 */

const { er } = require('../../general.js');
const {
	searchExactHebrewWord,
	ROOTS,
	dbPath
} = require('../exactHebrewIndex.js');
const {
	intValue,
	query
} = require('./values.js');

function exactRoutes($i) {
	return {
		'/search/exact/hebrew': async () => {
			const values = query($i);
			const word = values.word || values.q || values.term;
			if (!word) {
				return er({
					code: 'MISSING_WORD',
					message: 'Pass ?word=אמר'
				});
			}
			return {
				success: searchExactHebrewWord({
					word,
					corpus: values.corpus || 'tanach',
					limit: intValue(values.limit, 25, 200),
					offset: intValue(values.offset, 0, 1000000)
				})
			};
		},
		'/search/exact/hebrew/meta': async () => ({
			success: {
				dbPath: dbPath(),
				corpora: ROOTS,
				searchTypes: [
					'exactWord',
					'libraryText',
					'localRagVector'
				]
			}
		})
	};
}

module.exports = {
	exactRoutes
};
