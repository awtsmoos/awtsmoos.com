// B"H
/**
 * @module UniverseStore
 * @description
 * Chapter 171: The Keter store. Every entity can be created, nested, linked,
 * forked, snapshotted, and read as DNA. DNA is refreshed after forks and links
 * so the living graph does not return stale ancestry.
 */

const { er } = require('../general.js');
const { normalizeEntity, entityPointer, EDGE_TYPES, makeId } = require('./universeSchema.js');
const paths = require('./universePaths.js');
const { buildDna } = require('./universeDna.js');

async function read($i, path, fallback = null) {
  try { return (await $i.db.get(path)) ?? fallback; } catch { return fallback; }
}

async function writeList($i, path, value) {
  const current = await read($i, path, []);
  const list = Array.isArray(current) ? current : Object.keys(current || {});
  if (!list.includes(value)) list.push(value);
  await $i.db.write(path, list);
}

async function folderValues($i, folderPath) {
  const root = await read($i, folderPath, {});
  if (Array.isArray(root)) {
    const out = [];
    for (const item of root) {
      if (item && typeof item === 'object' && item.id) out.push(item);
      else {
        const hydrated = await read($i, `${folderPath}/${item}`, null);
        if (hydrated && typeof hydrated === 'object') out.push(hydrated);
      }
    }
    return out;
  }
  if (!root || typeof root !== 'object') return [];
  const out = [];
  for (const [key, value] of Object.entries(root)) {
    if (value && typeof value === 'object' && value.id) out.push(value);
    else {
      const hydrated = await read($i, `${folderPath}/${key}`, null);
      if (hydrated && typeof hydrated === 'object') out.push(hydrated);
    }
  }
  return out;
}

async function writeEntity({ $i, input }) {
  const entity = normalizeEntity(input);
  await $i.db.write(paths.data(entity), entity);
  await writeList($i, paths.globalIndex(entity.type), entity.id);
  if (entity.aliasId) await writeList($i, paths.aliasIndex(entity.aliasId), `${entity.type}/${entity.id}`);
  if (entity.heichelId) await writeList($i, paths.heichelIndex(entity.heichelId), `${entity.type}/${entity.id}`);
  if (entity.heichelId) await writeList($i, paths.seriesIndex(entity.heichelId, entity.seriesId), `${entity.type}/${entity.id}`);
  if (entity.parentId) await writeList($i, paths.children({ type: 'post', id: entity.parentId }), `${entity.type}/${entity.id}`);
  await materializeDna({ $i, entity });
  return { success: entity };
}

async function getEntity({ $i, type, id }) {
  const entity = await read($i, paths.data({ type, id }), null);
  return entity ? { success: entity } : er({ code: 'ENTITY_NOT_FOUND', message: `${type}/${id} not found.` });
}

async function listEntities({ $i, type, aliasId = '', heichelId = '', seriesId = '' }) {
  const indexPath = aliasId ? paths.aliasIndex(aliasId) : heichelId && seriesId ? paths.seriesIndex(heichelId, seriesId) : heichelId ? paths.heichelIndex(heichelId) : paths.globalIndex(type || 'post');
  const ids = await read($i, indexPath, []);
  const out = [];
  for (const item of Array.isArray(ids) ? ids : Object.keys(ids || {})) {
    const [itemType, itemId] = String(item).includes('/') ? String(item).split('/') : [type, item];
    if (type && itemType !== type) continue;
    const got = await getEntity({ $i, type: itemType, id: itemId });
    if (got.success) out.push(got.success);
  }
  return { success: out };
}

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

module.exports = { writeEntity, getEntity, listEntities, linkEntities, listEdges, addChild, getChildren, snapshotEntity, forkEntity, materializeDna, getDna };
