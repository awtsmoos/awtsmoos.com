/* B"H */
export function createRelinkEngine(input = {}) { return { kind:'RelinkEngine', attempts:input.attempts || [] }; }
export function markOffline(asset, reason = 'missing') { asset.offline = true; asset.offlineReason = reason; return asset; }
export function relinkAsset(engine, asset, uri) { const attempt = { assetId:asset.id, from:asset.uri, to:uri, at:Date.now() }; engine.attempts.push(attempt); asset.uri = uri; asset.offline = false; delete asset.offlineReason; return attempt; }
export function findRelinkCandidates(assets = [], filename = '') { const q = filename.toLowerCase(); return assets.filter(a => a.offline && (a.name || '').toLowerCase().includes(q)); }
