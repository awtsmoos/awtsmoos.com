//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module SocialRelationshipStore
 * @description The Awtsmoos relates without confusion; Awtsmoos.com gives Alias, Heichel, and Series targets distinct keys while preserving old alias roads;
 * every relationship can be created, observed, listed, and removed so Follow never becomes an irreversible social load.
 */
const { get, list, put, remove } = require('./platformStore.js');

const TYPES = new Set(['follow', 'mute', 'block', 'trust', 'subscribe']);
const TARGET_TYPES = new Set(['alias', 'heichel', 'series']);

/** Converts one typed social target into a collision-safe persistent key. */
function relationshipTargetKey(targetType = 'alias', targetId = '') {
	const normalizedType = String(targetType || 'alias').toLowerCase();
	const normalizedId = String(targetId || '').trim();
	if (!TARGET_TYPES.has(normalizedType) || !normalizedId) return '';
	return normalizedType === 'alias'
		? normalizedId
		: `${normalizedType}:${normalizedId}`;
}

/** Builds the canonical graph-store key parts for one relationship edge. */
function relationshipParts(type, fromAlias, targetKey) {
	return ['relationships', type, fromAlias, targetKey];
}

/** Validates relationship vocabulary and target coordinates before storage. */
function relationshipError({ type, targetType, targetId }) {
	if (!TYPES.has(type)) return { code: 'BAD_RELATIONSHIP', message: 'Unsupported relationship.' };
	if (!TARGET_TYPES.has(targetType)) return { code: 'BAD_TARGET_TYPE', message: 'Unsupported relationship target type.' };
	if (!targetId) return { code: 'BAD_TARGET', message: 'Relationship target is required.' };
	return null;
}

/** Reads the current relationship record, including legacy non-namespaced targets for compatibility. */
function relationshipRecord({ $i, fromAlias, targetId, targetType = 'alias', type = 'follow' }) {
	const targetKey = relationshipTargetKey(targetType, targetId);
	const primary = get({ $i, shard: 'graph', parts: relationshipParts(type, fromAlias, targetKey) });
	if (primary || targetType === 'alias') return primary;
	return get({ $i, shard: 'graph', parts: relationshipParts(type, fromAlias, String(targetId)) });
}

/** Creates or refreshes one typed relationship edge. */
function setRelationship({ $i, fromAlias, targetId, toAlias, targetType = 'alias', type = 'follow' }) {
	const resolvedTarget = String(targetId || toAlias || '').trim();
	const error = relationshipError({ type, targetType, targetId: resolvedTarget });
	if (error) return { error };
	const targetKey = relationshipTargetKey(targetType, resolvedTarget);
	const relationship = {
		fromAlias,
		toAlias: targetKey,
		targetId: resolvedTarget,
		targetType,
		type,
		createdAt: Date.now()
	};
	put({
		$i,
		shard: 'graph',
		parts: relationshipParts(type, fromAlias, targetKey),
		value: relationship,
		meta: { kind: 'relationship', type, targetType }
	});
	return { success: relationship };
}

/** Returns whether one relationship edge currently exists. */
function hasRelationship(options) {
	return Boolean(relationshipRecord(options));
}

/** Removes a typed edge and any matching legacy raw-target edge. */
function removeRelationship({ $i, fromAlias, targetId, targetType = 'alias', type = 'follow' }) {
	const error = relationshipError({ type, targetType, targetId });
	if (error) return { error };
	const targetKey = relationshipTargetKey(targetType, targetId);
	remove({ $i, shard: 'graph', parts: relationshipParts(type, fromAlias, targetKey), meta: { kind: 'relationship', type, targetType } });
	if (targetType !== 'alias' && targetKey !== targetId) {
		remove({ $i, shard: 'graph', parts: relationshipParts(type, fromAlias, String(targetId)), meta: { kind: 'relationship', type, targetType: 'legacy' } });
	}
	return { success: { fromAlias, targetId, targetType, type, removed: true } };
}

/** Lists living relationship edges for one source alias. */
function listRelationships({ $i, aliasId, type = '' }) {
	const records = list({
		$i,
		shard: 'graph',
		predicate: record => record.meta?.kind === 'relationship'
			&& record.value?.fromAlias === aliasId
			&& (!type || record.value?.type === type)
	});
	return { success: records.map(record => record.value) };
}

module.exports = {
	TARGET_TYPES,
	TYPES,
	hasRelationship,
	listRelationships,
	relationshipParts,
	relationshipRecord,
	relationshipTargetKey,
	removeRelationship,
	setRelationship
};
