//B"H
//Blessed is He
//Boruch Hashem

/**
 * @module BulkPublish
 * @description
 * Lightning-fast bulk publish endpoint for series posts. Accepts an array of
 * post updates in a single request and applies them all inside one DB batch
 * boundary, using coalesced concurrent writes. One durability flush for the
 * entire batch instead of one per post.
 *
 * Route: POST /heichelos/:heichel/series/:series/posts/bulk
 * Body: { updates: [{ postId, fields: {...} }], options?: { createIfMissing } }
 */

const { MAX_BULK_UPDATES, MAX_BULK_BYTES, validateBulkBody } = require('./bulkPublishCore.js');
const { bulkPublishPosts } = require('./bulkPublishPosts.js');
const { bulkPublishRoute } = require('./bulkPublishRoute.js');

module.exports = {
	MAX_BULK_UPDATES,
	MAX_BULK_BYTES,
	bulkPublishPosts,
	bulkPublishRoute,
	validateBulkBody
};
