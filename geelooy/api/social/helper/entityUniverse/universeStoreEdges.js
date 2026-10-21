//B"H
//Blessed is He
//Boruch Hashem


/**
 * @module universeStoreEdges
 * @description
 * Entity edges, children linking and child listing.
 */

const { er } = require('../general.js');
const { normalizeEntity, entityPointer, EDGE_TYPES, makeId } = require('./universeSchema.js');
const paths = require('./universePaths.js');

function edgeId(kind, from, to) {
  return `${kind}_${from.type}_${from.id}_TO_${to.type}_${to.id}_${Date.now()}`;
}

async function linkEntities({ $i, from, to, kind = 'references', note = '', actorAlias = '' }) {
  if (!EDGE_TYPES.has(kind)) return er({ code: 'BAD_EDGE_KIND', message: `Unsupported edge kind ${kind}` });
  const source = entityPointer(from);
  const target = entityPointer(to);
  if (!source.id || !target.id) return er({ code: 'BAD_EDGE', message: 'from and to entity ids required.' });
  const edge = { id: edgeId(kind, source, target), kind, from: source, to: target, note, actorAlias, createdAt: Date.now() };
  await $i.db.write(paths.edge(source, 'out', edge.id), edge);
  await $i.db.write(paths.edge(target, 'in', edge.id), edge);
  const sourceEntity = await getEntity({ $i, type: source.type, id: source.id });
  if (sourceEntity.success) await materializeDna({ $i, entity: sourceEntity.success });
  const targetEntity = await getEntity({ $i, type: target.type, id: target.id });
  if (targetEntity.success) await materializeDna({ $i, entity: targetEntity.success });
  return { success: edge };
}

async function listEdges({ $i, entity, direction = 'out' }) {
  const pointer = entityPointer(entity);
  return { success: await folderValues($i, paths.edges(pointer, direction)) };
}

async function addChild({ $i, parent, child }) {
  const parentPointer = entityPointer(parent);
  const childEntity = normalizeEntity({ ...child, parentId: parentPointer.id });
  await writeEntity({ $i, input: childEntity });
  await writeList($i, paths.children(parentPointer), `${childEntity.type}/${childEntity.id}`);
  await linkEntities({ $i, from: parentPointer, to: childEntity, kind: 'contains', actorAlias: childEntity.aliasId });
  return { success: childEntity };
}

async function getChildren({ $i, entity }) {
  const pointer = entityPointer(entity);
  const ids = await read($i, paths.children(pointer), []);
  const out = [];
  for (const item of Array.isArray(ids) ? ids : Object.keys(ids || {})) {
    const [type, id] = String(item).split('/');
    const got = await getEntity({ $i, type, id });
    if (got.success) out.push(got.success);
  }
  return { success: out };
}

module.exports = {
	edgeId,
	linkEntities,
	listEdges,
	addChild,
	getChildren
};

const { folderValues, read, writeList } = require('./universeStoreIo.js');
const { getEntity, writeEntity } = require('./universeStoreEntities.js');
const { materializeDna } = require('./universeStoreDna.js');
