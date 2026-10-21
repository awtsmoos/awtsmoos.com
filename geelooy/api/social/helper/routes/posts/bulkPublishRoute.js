//B"H
//Blessed is He
//Boruch Hashem

/**
 * @module BulkPublishRoute
 * @description
 * Sibling of BulkPublish: the bulk publish route handler, relocated verbatim.
 */

const { getDeps, MAX_BULK_BYTES, validateBulkBody } = require('./bulkPublishCore.js');
const { loggedIn, er, verifyHeichelAuthority } = getDeps();
const { bulkPublishPosts } = require('./bulkPublishPosts.js');

/**
 * Route handler for POST /heichelos/:heichel/series/:series/posts/bulk
 */
async function bulkPublishRoute({ $i, heichelId, seriesId }) {
	if (!loggedIn($i)) return er({ message: "NO_LOGIN" });

	const aliasId = $i.$_POST?.aliasId;
	if (!aliasId) return er({ code: "MISSING_PARAMS", details: "Requires aliasId" });

	const isAuthorized = await verifyHeichelAuthority({ $i, aliasId, heichelId });
	if (!isAuthorized) return er({ code: "NO_AUTH" });

	// Payload size guard
	let bodySize = 0;
	try {
		bodySize = JSON.stringify($i.$_POST).length;
	} catch (e) { /* ignore */ }
	if (bodySize > MAX_BULK_BYTES) {
		return er({ code: "PAYLOAD_TOO_LARGE", max: MAX_BULK_BYTES });
	}

	const validation = validateBulkBody($i.$_POST);
	if (validation.error) {
		return er({ code: validation.error, details: validation });
	}

	const createIfMissing = $i.$_POST?.options?.createIfMissing === true;

	try {
		return await bulkPublishPosts({
			$i,
			heichelId,
			seriesId,
			updates: validation.updates,
			createIfMissing
		});
	} catch (e) {
		return er({ code: "BULK_PUBLISH_FAILED", details: e.message, stack: e.stack });
	}
}

module.exports = { bulkPublishRoute };
