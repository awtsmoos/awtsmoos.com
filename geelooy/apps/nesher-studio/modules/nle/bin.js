/* B"H
The bin receives sparks and names them before the editor bends time.
*/
export function createBin() {
  return { selectedAssetId:'asset-canvas', assets:[asset('asset-canvas','Canvas capture','canvas',12), asset('asset-stream','Live stream capture','stream',12)] };
}
export function addAsset(bin, input = {}) {
  const item = asset(input.id || `asset-${crypto.randomUUID?.() || Date.now()}`, input.name || 'Untitled asset', input.kind || 'media', Number(input.duration || 8));
  bin.assets.push(item); bin.selectedAssetId = item.id; return item;
}
export function selectAsset(bin, id) { if (bin.assets.some(a => a.id === id)) bin.selectedAssetId = id; return selectedAsset(bin); }
export function selectedAsset(bin) { return bin.assets.find(a => a.id === bin.selectedAssetId) || bin.assets[0] || null; }
function asset(id, name, kind, duration) { return { id, name, kind, duration, createdAt:Date.now() }; }
