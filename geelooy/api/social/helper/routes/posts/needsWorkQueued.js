//B"H
//Blessed is He
//Boruch Hashem

/**
 * @module NeedsWorkQueued
 * @description
 * Sibling of NeedsWorkRoutes: submitted-but-unapproved queue, relocated verbatim.
 */

const { GAP_PRIORITY } = require('./needsWorkConstants.js');

/** Submitted-but-unapproved posts per heichel (the production "ready but unimported" queue). */
async function submittedUnapproved($i, heichelIds, wanted) {
	const out = [];
	if (wanted && !wanted.has("submitted_unapproved")) return out;
	let listLegacyPosts = null;
	try {
		listLegacyPosts = require("../post/submissions.js").getSubmittedPosts;
	} catch {
		return out;
	}
	for (const heichelId of heichelIds) {
		try {
			const queued = await listLegacyPosts({ $i, heichelId });
			const items = Array.isArray(queued) ? queued : (queued && queued.success) || [];
			for (const item of [].concat(items)) {
				if (item && typeof item === "object") {
					out.push({
						heichelId,
						postId: item.postId || item.id || null,
						title: item.title || item.postId || "untitled",
						gaps: ["submitted_unapproved"],
						priority: GAP_PRIORITY.submitted_unapproved
					});
				}
			}
		} catch {
			/* one bad heichel queue never sinks the report */
		}
	}
	return out;
}

module.exports = { submittedUnapproved };
