/* B"H */
export function createMetadataStore(input = {}) { return { kind:'MetadataStore', records:{ ...(input.records || {}) } }; }
export function setMetadata(store, assetId, metadata = {}) { store.records[assetId] = { ...(store.records[assetId] || {}), ...metadata, updatedAt:Date.now() }; return store.records[assetId]; }
export function getMetadata(store, assetId) { return store.records[assetId] || {}; }
export function inferMetadata(file = {}) { return { name:file.name || 'Untitled', size:file.size || 0, type:file.type || '', extension:(file.name || '').split('.').pop()?.toLowerCase() || '' }; }
