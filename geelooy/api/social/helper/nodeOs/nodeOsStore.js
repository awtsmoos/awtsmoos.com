// B"H
/**
 * @module NodeOsStore
 * @description
 * Chapter 193: The living filesystem store. It writes social nodes, mounts them
 * at readable OS paths, hydrates folders, and falls back to old post/comment/
 * asset paths when a new Node OS node has not yet been migrated.
 */

const paths = require('./nodeOsPaths.js');
const { normalizeNode, childPointer, nodeIdFrom } = require('./nodeOsSchema.js');
const { getEntity } = require('../entityUniverse/universeStore.js');
const { listAssetManifests } = require('../assets/assetManifest.js');

async function read($i, path, fallback = null) {
  try { return (await $i.db.get(path)) ?? fallback; } catch { return fallback; }
}

async function listify($i, value) {
  const raw = Array.isArray(value) ? value : value && typeof value === 'object' ? Object.values(value) : [];
  const out = [];
  for (const item of raw) {
    if (item && typeof item === 'object') out.push(item);
    else {
      const got = await read($i, paths.nodeData(item), null);
      out.push(got || { id: item, kind: 'node', title: item, path: '' });
    }
  }
  return out;
}

async function writeNode({ $i, input }) {
  const node = normalizeNode(input);
  await $i.db.write(paths.nodeData(node.id), node);
  await $i.db.write(paths.mountPath(node.path), { nodeId: node.id, kind: node.kind, path: node.path, title: node.title });
  if (node.parentId) await $i.db.write(paths.nodeChild(node.parentId, node.id), childPointer(node));
  await $i.db.write(`${paths.nodeHistory(node.id)}/${Date.now()}`, { action: 'write', node, at: Date.now() });
  return { success: node };
}

async function getNode({ $i, nodeId }) {
  const node = await read($i, paths.nodeData(nodeId), null);
  return node ? { success: node } : { error: { code: 'NODE_NOT_FOUND', message: `Node ${nodeId} not found.` } };
}

async function getByPath({ $i, path }) {
  const mount = await read($i, paths.mountPath(path), null);
  if (mount?.nodeId) return await getNode({ $i, nodeId: mount.nodeId });
  return await legacyPathFallback({ $i, path });
}

async function childrenOf({ $i, nodeId }) {
  const children = await read($i, paths.nodeChildren(nodeId), {});
  return { success: await listify($i, children) };
}

async function legacyPathFallback({ $i, path }) {
  const parts = String(path || '').split('/').filter(Boolean);
  if (parts[0] === 'Heichelos' && parts[2] === 'Series' && parts[4] === 'Posts') {
    const heichelId = parts[1];
    const postId = parts[5];
    const post = await read($i, `/social/heichelos/${heichelId}/posts/${postId}`, null);
    if (post) return { success: normalizeNode({ id: nodeIdFrom('legacyPost', `${heichelId}/${postId}`), kind: 'legacyPost', title: post.title || postId, path, source: { legacy: true, heichelId, postId }, content: post.content || post.rootContent || '' }) };
  }
  return { error: { code: 'PATH_NOT_FOUND', message: `No node mounted at ${path}` } };
}

async function mountEntity({ $i, entity }) {
  const node = await writeNode({ $i, input: { id: nodeIdFrom(entity.type, entity.id), kind: entity.type, title: entity.title, path: paths.entityMount(entity), source: { entityType: entity.type, entityId: entity.id, heichelId: entity.heichelId, seriesId: entity.seriesId }, content: entity.rootContent || entity.summary || '', meta: { entity } } });
  for (const child of entity.nodes || []) await mountContentNode({ $i, parentNode: node.success, entity, contentNode: child });
  return node;
}

async function mountContentNode({ $i, parentNode, entity, contentNode }) {
  const node = await writeNode({ $i, input: { id: nodeIdFrom('contentNode', `${entity.id}/${contentNode.id}`), kind: contentNode.type || 'section', title: contentNode.title || contentNode.id, path: `${parentNode.path}/Nodes/${contentNode.id}`, parentId: parentNode.id, source: { entityType: entity.type, entityId: entity.id, nodeId: contentNode.id }, content: contentNode.content || '', meta: { contentNode } } });
  for (const child of contentNode.children || []) await mountContentNode({ $i, parentNode: node.success, entity, contentNode: child });
  return node;
}

async function mountAsset({ $i, manifest }) {
  return await writeNode({ $i, input: { id: nodeIdFrom('asset', manifest.id), kind: manifest.type || 'asset', title: manifest.originalName || manifest.id, path: paths.assetMount(manifest), source: { assetId: manifest.id, aliasId: manifest.aliasId }, mime: manifest.mime, size: manifest.size, publicPath: manifest.publicPath, content: manifest.originalName || '', meta: { manifest } } });
}

async function mountUniverseEntity({ $i, type, id }) {
  const got = await getEntity({ $i, type, id });
  if (!got.success) return got;
  return await mountEntity({ $i, entity: got.success });
}

async function mountAliasAssets({ $i, aliasId }) {
  const manifests = await listAssetManifests({ $i, aliasId });
  const mounted = [];
  for (const manifest of manifests) mounted.push((await mountAsset({ $i, manifest })).success);
  return { success: mounted };
}

module.exports = { writeNode, getNode, getByPath, childrenOf, mountEntity, mountContentNode, mountAsset, mountUniverseEntity, mountAliasAssets };
