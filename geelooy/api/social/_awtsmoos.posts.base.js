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
const {
	createNeedsWorkRoutes
} = require('./helper/routes/posts/needsWorkRoutes.js');
const {
	scheduleSeriesBootWarm
} = require('./helper/post/seriesBootWarm.js');

module.exports = ({ $i, userid } = {}) => {
	installSocialDbBridge($i);
	// B"H 2026-11-26 (boot-warm round): the route factory first runs at
	// process start; schedule the one deferred large-series memo warm
	// here so the first real details request is not the cold fill.
	// Idempotent per process — later compositions are no-ops.
	scheduleSeriesBootWarm($i);
	return {
		...createAliasPostRoutes({ $i }),
		...createPostSubmissionRoutes({ $i }),
		...createSeriesPostRoutes({ $i, userid }),
		...createNeedsWorkRoutes({ $i, userid })
	};
};
