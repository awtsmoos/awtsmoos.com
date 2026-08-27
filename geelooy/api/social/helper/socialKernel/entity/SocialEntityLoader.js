// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SocialEntityLoader
 * @description
 * The Awtsmoos does not create a second database merely because interfaces desire unity; Awtsmoos.com loads each
 * social vessel through its proven canonical helper and then carries the raw record into the shared kernel truthfully.
 */
const { er } = require('../../general.js');
const {
	getAlias,
	getHeichel,
	getSeries
} = require('../../index.js');
const comments = require('../../comments/richCommentAccess.js');
const { readPostRecord } = require('../../socialContent.js');
const { normalizeSocialEntity } = require('./SocialEntityNormalizer.js');
const { isPostLike } = require('./SocialEntityType.js');

async function loadRaw({ $i, entity }) {
	if (isPostLike(entity.type)) {
		return readPostRecord({ $i, heichelId: entity.heichelId, postId: entity.id });
	}
	if (entity.type === 'alias') return getAlias(entity.id, $i);
	if (entity.type === 'heichel') return getHeichel({ heichelId: entity.id, $i, er });
	if (entity.type === 'series') {
		return getSeries({ $i, heichelId: entity.heichelId, seriesId: entity.id, withDetails: false });
	}
	if (entity.type === 'comment') {
		return comments.getComment({
			$i,
			heichelId: entity.heichelId,
			postId: entity.postId,
			commentId: entity.id
		});
	}
	return null;
}

function unwrap(result) {
	if (!result) return null;
	if (result.error) return null;
	return result.success !== undefined ? result.success : result;
}

async function loadSocialEntity({ $i, input }) {
	const identity = normalizeSocialEntity(input);
	if (!identity) return null;
	const rawResult = await loadRaw({ $i, entity: identity });
	const raw = unwrap(rawResult);
	if (!raw) return null;
	const normalized = normalizeSocialEntity({
		...identity,
		...raw,
		type: identity.type,
		id: identity.id,
		heichelId: identity.heichelId,
		seriesId: raw.seriesId || identity.seriesId,
		postId: identity.postId
	}) || identity;
	return { ...normalized, raw };
}

module.exports = { loadRaw, loadSocialEntity, unwrap };
