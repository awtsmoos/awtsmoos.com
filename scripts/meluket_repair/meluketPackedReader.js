// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module MeluketPackedReader
 * @description
 * Legacy packed identities cross the federation bridge and emerge as the
 * current identities owned by live source-series membership and comments.
 */

const {
	MONTHS
} = require("./meluketRepairConstants.js");
const {
	readIdentityMap
} = require("./meluketIdentityMap.js");
const {
	closePackedPosts,
	openPackedPosts,
	readPackedBundle
} = require("./meluketPackedDb.js");

function convertPost(legacyPostId, post, identity, sourceId) {
	if (!post || typeof post !== "object" || Buffer.isBuffer(post)) {
		throw new Error(`Invalid packed post ${legacyPostId}`);
	}
	if (post.id && post.id !== legacyPostId) {
		throw new Error(`Packed post identity mismatch: ${legacyPostId}`);
	}
	const hasContent = Boolean(
		post.content
		|| post.dayuh?.sections?.length
		|| post.sections?.length
	);
	if (!hasContent) throw new Error(`Packed post lacks content: ${legacyPostId}`);
	return {
		...post,
		id: identity.currentPostId,
		legacyPostId,
		parentSeriesId: sourceId
	};
}

function convertMonth(database, identities, month, seen) {
	const bundle = readPackedBundle(database, month.sourceId);
	const bridge = identities.bySource.get(month.sourceId) || new Map();
	const posts = {};
	for (const [legacyPostId, post] of Object.entries(bundle.posts)) {
		const identity = bridge.get(legacyPostId);
		if (!identity) throw new Error(`Unmapped packed post: ${legacyPostId}`);
		if (identity.aliasId !== month.aliasId) {
			throw new Error(`Alias mismatch for ${legacyPostId}`);
		}
		if (seen.has(identity.currentPostId)) {
			throw new Error(`Duplicate current post: ${identity.currentPostId}`);
		}
		seen.add(identity.currentPostId);
		posts[identity.currentPostId] = convertPost(
			legacyPostId,
			post,
			identity,
			month.sourceId
		);
	}
	if (bridge.size !== Object.keys(posts).length) {
		throw new Error(`Identity-map count mismatch: ${month.sourceId}`);
	}
	return {
		...month,
		...bundle,
		posts,
		postIds: Object.keys(posts)
	};
}

function readPackedMonths() {
	const identities = readIdentityMap();
	const database = openPackedPosts();
	const seen = new Set();
	try {
		const months = MONTHS.map(month => (
			convertMonth(database, identities, month, seen)
		));
		if (seen.size !== identities.count) {
			throw new Error("Global map count mismatch.");
		}
		return months;
	} finally {
		closePackedPosts(database);
	}
}

function readMapRecordCount() {
	return readIdentityMap().count;
}

module.exports = {
	readMapRecordCount,
	readPackedMonths
};
