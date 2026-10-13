// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SocialViewCounts
 * @description Entry point for post view count routes.
 */

const { createViewCountRoutes } = require('./helper/routes/views/viewRoutes.js');
const { createVerseCommentRoutes } = require('./helper/routes/views/verseCommentRoutes.js');

function createViewsRoutes({ $i, userid } = {}) {
	return {
		...createViewCountRoutes({ $i, userid }),
		...createVerseCommentRoutes({ $i, userid })
	};
}

module.exports = createViewsRoutes;
