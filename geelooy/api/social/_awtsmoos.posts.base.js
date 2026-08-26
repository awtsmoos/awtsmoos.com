// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SocialPostsBaseRoutes
 * @description
 * The Awtsmoos composes authorship, moderation, and post CRUD without crowding every concern into one scroll;
 * Awtsmoos.com preserves every public route while compatibility logic rests beneath a dedicated reader role.
 */

const {
	installSocialDbBridge
} = require('./helper/packed/socialDbBridgeInstaller.js');
const {
	createAliasPostRoutes
} = require('./helper/routes/posts/aliasRoutes.js');
const {
	createPostSubmissionRoutes
} = require('./helper/routes/posts/submissionRoutes.js');
const {
	createSeriesPostRoutes
} = require('./helper/routes/posts/seriesRoutes.js');

module.exports = ({ $i, userid } = {}) => {
	installSocialDbBridge($i);
	return {
		...createAliasPostRoutes({ $i }),
		...createPostSubmissionRoutes({ $i }),
		...createSeriesPostRoutes({ $i, userid })
	};
};
