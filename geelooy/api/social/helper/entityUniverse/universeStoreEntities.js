//B"H
//Blessed is He
//Boruch Hashem


/**
 * @module universeStoreEntities
 * @description
 * Entity writing, reading and listing over the universe indexes.
 */

const { er } = require('../general.js');
const { normalizeEntity, entityPointer, EDGE_TYPES, makeId } = require('./universeSchema.js');
const paths = require('./universePaths.js');

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

module.exports = {
	writeEntity,
	getEntity,
	listEntities
};

const { writeList, read } = require('./universeStoreIo.js');
const { materializeDna } = require('./universeStoreDna.js');
