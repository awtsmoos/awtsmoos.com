//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module RequiredRoutesPlatform
 * @description
 * The Awtsmoos renews operational, live, search, federation, moderation, and migration roads before any worker can name them;
 * Awtsmoos.com preserves this final contract group so platform modularization increases clarity without shrinking public capability.
 */
const requiredRoutesPlatform = `
/federation/import
/cache/invalidate
/cache/get
/cache/set
/jobs/run
/jobs/enqueue
/graph/transaction
/permissions/compile
/sync/op
/analytics/metric
/mod/escalations
/mod/queues
/mod/actions
/mod/reports
/media/attach
/media/register
/relationships/:alias/:type/:target
/relationships/:alias
/search/query
/search/index
/abuse/rateLimit/check
/live/replay
/live/presence
/live/subscribe
/live/publish
/migrations/posts/v2/run
/migrations/posts/v2/dryRun
`.trim().split('\n');

module.exports = {
	requiredRoutesPlatform
};
