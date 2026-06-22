/* B"H
The bin is a chamber of raw sparks before timeline order descends.
*/
export function createBin() { return { assets:[sample('asset-canvas','Canvas capture','canvas'), sample('asset-stream','Live stream capture','stream')] }; }
export function addAsset(bin, input = {}) { const asset = { id:input.id || `asset-${crypto.randomUUID?.() || Date.now()}`, name:input.name || 'Untitled asset', kind:input.kind || 'media', duration:Number(input.duration || 0), createdAt:Date.now() }; bin.assets.push(asset); return asset; }
function sample(id, name, kind) { return { id, name, kind, duration:0, createdAt:Date.now() }; }
