/* B"H
The bin is a library of sparks: assets, folders, offline states, and metadata.
No raw media is created here; only descriptors move through the vessel.
*/
export function createAssetDatabase(input = {}) {
  return { kind:'AssetDatabase', assets:input.assets || [], folders:input.folders || [{ id:'root', name:'Project Bin', parentId:null, assetIds:[] }], selectedAssetId:input.selectedAssetId || null };
}
export function addAssetRecord(db, asset = {}) {
  const model = { id:asset.id || id('asset'), name:asset.name || 'Untitled', mediaKind:asset.mediaKind || asset.type || 'media', uri:asset.uri || null, duration:Number(asset.duration || 0), folderId:asset.folderId || 'root', offline:!!asset.offline, metadata:asset.metadata || {}, proxies:asset.proxies || [], thumbnails:asset.thumbnails || [], tags:asset.tags || [] };
  db.assets.push(model); ensureFolder(db, model.folderId).assetIds.push(model.id); db.selectedAssetId = model.id; return model;
}
export function removeAssetRecord(db, assetId) { const i = db.assets.findIndex(a => a.id === assetId); if (i < 0) return null; db.folders.forEach(f => f.assetIds = f.assetIds.filter(id => id !== assetId)); return db.assets.splice(i, 1)[0]; }
export function getAssetRecord(db, assetId) { return db.assets.find(a => a.id === assetId) || null; }
export function ensureFolder(db, folderId = 'root') { let folder = db.folders.find(f => f.id === folderId); if (!folder) db.folders.push(folder = { id:folderId, name:folderId, parentId:'root', assetIds:[] }); return folder; }
function id(prefix) { return `${prefix}-${globalThis.crypto?.randomUUID?.() || Date.now()}`; }
