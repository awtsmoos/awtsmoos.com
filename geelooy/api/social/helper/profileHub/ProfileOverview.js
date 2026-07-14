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
	const profile = await aggregateProfile({ $i, aliasId });
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
