// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SocialCapabilityPolicy
 * @description
 * The Awtsmoos gives possibility without deception; Awtsmoos.com computes conservative capabilities from proven entity law,
 * while one request-scoped authority vessel prevents the same Heichel truth from being fetched again under every visible card.
 */
const { verifyHeichelAuthority } = require('../../index.js');
const { DISCUSSABLE_TYPES, isPostLike } = require('../entity/SocialEntityType.js');
const { capability, unsupported } = require('./SocialCapabilityCatalog.js');

function authorAlias(entity = {}) {
	return String(
		entity.raw?.authorAliasId
		|| entity.raw?.aliasId
		|| entity.raw?.author
		|| entity.aliasId
		|| ''
	);
}

function authorityKey(entity = {}, viewerAliasId = '') {
	return `${String(viewerAliasId || '')}:${String(entity.heichelId || '')}`;
}

async function readAuthority({ $i, entity, viewerAliasId }) {
	try {
		return Boolean(await verifyHeichelAuthority({
			$i,
			heichelId: entity.heichelId,
			aliasId: viewerAliasId
		}));
	} catch {
		return false;
	}
}

async function heichelAuthority({ $i, entity, viewerAliasId, authorityCache = null }) {
	if (!entity.heichelId || !viewerAliasId) return false;
	const key = authorityKey(entity, viewerAliasId);
	if (authorityCache?.has(key)) return Boolean(await authorityCache.get(key));
	const pending = readAuthority({ $i, entity, viewerAliasId });
	authorityCache?.set(key, pending);
	const result = await pending;
	authorityCache?.set(key, result);
	return result;
}

function answerCapability(entity, summary) {
	if (entity.type !== 'question') {
		return capability(false, 'Formal answers apply only to questions.');
	}
	const answers = summary?.answers;
	if (!answers || answers.policyAvailable === false || answers.open === null || answers.open === undefined) {
		return capability(false, 'Answer policy could not be verified.');
	}
	return answers.open
		? capability(true)
		: capability(false, 'Formal answers are closed for this question.');
}

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
		follow: unsupported('Follow storage is not yet unified.'),
		save: unsupported('Save/library storage is not yet unified.'),
		collaborate: unsupported('Collaboration capability requires canonical role storage.')
	};
}

module.exports = { answerCapability, authorityKey, authorAlias, heichelAuthority, readAuthority, socialCapabilities };
