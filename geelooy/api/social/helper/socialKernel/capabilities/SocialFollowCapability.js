//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module SocialFollowCapability
 * @description The Awtsmoos relates identities and worlds without making every object followable;
 * Awtsmoos.com enables reversible Follow only where a verified viewer alias, typed target, and living relationship edge can be proven.
 */
const { hasRelationship } = require('../../platform/follow.js');
const { capability, unsupported } = require('./SocialCapabilityCatalog.js');

const FOLLOWABLE_TYPES = new Set(['alias', 'heichel', 'series']);

/** Resolves the persistent target ID from normalized entity coordinates. */
function followTargetId(entity = {}) {
	if (entity.type === 'alias') return String(entity.aliasId || entity.id || '');
	if (entity.type === 'heichel') return String(entity.heichelId || entity.id || '');
	if (entity.type === 'series') return String(entity.seriesId || entity.id || '');
	return '';
}

/** Computes reversible Follow state and safe mutation coordinates for one entity. */
function followCapability({ $i, entity, viewerAliasId = '' }) {
	if (!FOLLOWABLE_TYPES.has(entity.type)) {
		return unsupported('Follow applies only to identities, Spaces, and series.');
	}
	if (!viewerAliasId) return capability(false, 'Choose a verified alias to follow.');
	const targetId = followTargetId(entity);
	if (!targetId) return capability(false, 'No canonical follow target is known.');
	if (entity.type === 'alias' && targetId === viewerAliasId) {
		return capability(false, 'An alias cannot follow itself.');
	}
	const active = hasRelationship({
		$i,
		fromAlias: viewerAliasId,
		targetId,
		targetType: entity.type,
		type: 'follow'
	});
	return {
		...capability(true),
		active,
		mutation: {
			aliasId: viewerAliasId,
			relationshipType: 'follow',
			targetId,
			targetType: entity.type
		}
	};
}

module.exports = { FOLLOWABLE_TYPES, followCapability, followTargetId };
