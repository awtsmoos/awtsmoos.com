//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module SocialCapabilityPolicy
 * @description The Awtsmoos gives possibility without deception; Awtsmoos.com composes capability truth from entity law, policy, authority, and reversible graph state.
 */
const { DISCUSSABLE_TYPES, isPostLike } = require('../entity/SocialEntityType.js');
const { capability, unsupported } = require('./SocialCapabilityCatalog.js');
const { answerCapability } = require('./SocialAnswerCapability.js');
const {
	authorityKey,
	authorAlias,
	heichelAuthority,
	readAuthority
} = require('./SocialAuthorityCapability.js');
const { followCapability } = require('./SocialFollowCapability.js');

/** Computes the complete conservative action capability map for one normalized social entity. */
async function socialCapabilities({
	$i,
	entity,
	summary = null,
	viewerAliasId = '',
	deepLink = '',
	authorityCache = null
}) {
	const postLike = isPostLike(entity.type);
	const discussable = DISCUSSABLE_TYPES.includes(entity.type);
	const owner = Boolean(viewerAliasId && viewerAliasId === authorAlias(entity));
	const moderator = await heichelAuthority({ $i, entity, viewerAliasId, authorityCache });
	const commentsOpen = entity.raw?.commentsEnabled !== false;
	return {
		open: capability(Boolean(deepLink), 'No canonical destination is known.'),
		share: capability(Boolean(deepLink), 'No canonical destination is known.'),
		react: capability(discussable, 'This entity does not support reactions.'),
		reply: capability(discussable && commentsOpen, 'Discussion is closed for this entity.'),
		answer: answerCapability(entity, summary),
		reference: capability(postLike, 'Only canonical post-like content can be referenced.'),
		quote: capability(postLike, 'Only canonical post-like content can be quoted.'),
		repost: capability(postLike, 'Only canonical post-like content can be reposted.'),
		copy: capability(postLike, 'Only canonical post-like content can be copied.'),
		addToHeichel: capability(postLike, 'Only canonical post-like content can be added.'),
		edit: capability(owner, 'Only the verified author alias may edit this entity.'),
		delete: capability(owner || moderator, 'Author or Heichel authority is required.'),
		moderate: capability(moderator, 'Heichel authority is required.'),
		submit: capability(Boolean(viewerAliasId && entity.heichelId), 'Choose a verified alias and Heichel.'),
		follow: followCapability({ $i, entity, viewerAliasId }),
		save: unsupported('Save/library storage is not yet unified.'),
		collaborate: unsupported('Collaboration capability requires canonical role storage.')
	};
}

module.exports = {
	answerCapability,
	authorityKey,
	authorAlias,
	heichelAuthority,
	readAuthority,
	socialCapabilities
};
