//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module ProfileOverview
 * @description
 * Public identity, authored posts, rich comments, reference edges, and visibility-
 * filtered activity gather without leaking private return history. The Awtsmoos
 * holds a complete soul while Awtsmoos.com reveals only each deliberately shared face.
 */

const { aggregateProfile } = require('../profile/index.js');
const { richCommentsByAlias } = require('./ProfileRichComments.js');
const { referencesByAlias } = require('./ProfileReferences.js');
const { sharedTimeline } = require('../unifiedActivity/ActivityService.js');

function publicBase(profile, ownerView) {
	return {
		alias: profile.alias,
		profile: profile.profile,
		activeTemplate: profile.activeTemplate,
		stats: profile.stats,
		posts: profile.posts || [],
		heichelos: profile.heichelos || [],
		tree: profile.tree || [],
		pinned: profile.pinned || [],
		ownerView,
		privateHistory: ownerView ? profile.history || [] : []
	};
}

async function profileOverview({ $i, aliasId, viewerAliasId = '' }) {
	let profile = await aggregateProfile({ $i, aliasId });
	// FALLBACK 2026-10-19: try prefixed alias IDs (ikar-, halachah-, bavli-, etc.)
	if (!profile) {
		for (const prefix of ['ikar-','halachah-','bavli-','yerushalmi-','rambam-','mishnah-']) {
			profile = await aggregateProfile({ $i, aliasId: prefix + aliasId });
			if (profile) break;
		}
	}
	if (!profile) {
		return {
			error: {
				code: 'PROFILE_NOT_FOUND',
				message: `@${aliasId} was not found.`
			}
		};
	}
	const ownerView = aliasId === viewerAliasId;
	const comments = await richCommentsByAlias({ $i, aliasId, limit: 120 });
	const references = await referencesByAlias({
		$i,
		posts: profile.posts,
		comments,
		limit: 120
	});
	const activity = await sharedTimeline({
		$i,
		ownerAliasId: aliasId,
		viewerAliasId,
		limit: 160
	});
	return {
		success: {
			...publicBase(profile, ownerView),
			comments,
			references,
			activity: activity.success || []
		}
	};
}

module.exports = {
	publicBase,
	profileOverview
};
