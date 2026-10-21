//B"H
//Blessed is He
//Boruch Hashem


/**
 * @module universeStoreDna
 * @description
 * Entity snapshots, forks and DNA materialization.
 */

const { normalizeEntity, entityPointer, EDGE_TYPES, makeId } = require('./universeSchema.js');
const paths = require('./universePaths.js');
const { buildDna } = require('./universeDna.js');

async function snapshotEntity({ $i, entity, label = '' }) {
  const pointer = entityPointer(entity);
  const got = await getEntity({ $i, type: pointer.type, id: pointer.id });
  if (!got.success) return got;
  const snap = { id: makeId('snapshot'), label, entity: got.success, createdAt: Date.now() };
  await $i.db.write(paths.snapshot(pointer, snap.id), snap);
  await materializeDna({ $i, entity: got.success });
  return { success: snap };
}

async function forkEntity({ $i, entity, aliasId = '', title = '' }) {
  const pointer = entityPointer(entity);
  const got = await getEntity({ $i, type: pointer.type, id: pointer.id });
  if (!got.success) return got;
  const fork = normalizeEntity({ ...got.success, id: makeId(`${got.success.type}_fork`), title: title || `${got.success.title} Fork`, aliasId: aliasId || got.success.aliasId, parentId: got.success.id });
  await writeEntity({ $i, input: fork });
  await $i.db.write(paths.fork(pointer, fork.id), { id: fork.id, type: fork.type, createdAt: Date.now() });
  await linkEntities({ $i, from: fork, to: got.success, kind: 'forkedFrom', actorAlias: fork.aliasId });
  await materializeDna({ $i, entity: got.success });
  return { success: fork };
}

async function materializeDna({ $i, entity }) {
  const inbound = (await listEdges({ $i, entity, direction: 'in' })).success || [];
  const outbound = (await listEdges({ $i, entity, direction: 'out' })).success || [];
  const children = (await getChildren({ $i, entity })).success || [];
  const snapshots = await folderValues($i, paths.snapshots(entity));
  const forks = await folderValues($i, paths.forks(entity));
  const dna = buildDna({ entity, inbound, outbound, children, snapshots, forks });
  await $i.db.write(paths.dna(entity), dna);
  return { success: dna };
}

async function getDna({ $i, entity }) {
  const pointer = entityPointer(entity);
  const got = await getEntity({ $i, type: pointer.type, id: pointer.id });
  if (!got.success) return got;
  return await materializeDna({ $i, entity: got.success });
}

module.exports = {
	snapshotEntity,
	forkEntity,
	materializeDna,
	getDna
};

const { getEntity, writeEntity } = require('./universeStoreEntities.js');
const { listEdges, getChildren, linkEntities } = require('./universeStoreEdges.js');
const { folderValues } = require('./universeStoreIo.js');
