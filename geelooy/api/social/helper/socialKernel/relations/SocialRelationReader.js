// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SocialRelationReader
 * @description
 * The Awtsmoos lets relationships be named before every one has storage; Awtsmoos.com reads only canonical graph
 * kinds that truly exist today, while future semantic kinds return explicit unsupported state instead of fictional edges away.
 */
const { listGraphReferences } = require('../../socialGraph.js');
const { GRAPH_ENTITY_TYPES } = require('../entity/SocialEntityType.js');
const { relationDefinition } = require('./SocialRelationCatalog.js');

function graphEntity(entity) {
	return {
		type: entity.type,
		id: entity.id,
		heichelId: entity.heichelId,
		seriesId: entity.seriesId,
		parentId: entity.parentId,
		aliasId: entity.aliasId
	};
}

async function readSocialRelations({ $i, entity, kind, direction = 'outbound' }) {
	const definition = relationDefinition(kind);
	if (!definition) return { kind, available: false, reason: 'unknown-relation', items: [] };
	if (!definition.storageKind) return { kind, available: false, reason: 'storage-not-yet-canonical', items: [] };
	if (!GRAPH_ENTITY_TYPES.includes(entity.type)) {
		return { kind, available: false, reason: 'entity-not-graph-backed', items: [] };
	}
	const result = await listGraphReferences({
		$i,
		entity: graphEntity(entity),
		direction,
		kind: definition.storageKind
	});
	if (result?.error) return { kind, available: false, reason: 'graph-read-failed', items: [] };
	return {
		kind,
		available: true,
		direction,
		items: Array.isArray(result?.success) ? result.success : []
	};
}

module.exports = { graphEntity, readSocialRelations };
