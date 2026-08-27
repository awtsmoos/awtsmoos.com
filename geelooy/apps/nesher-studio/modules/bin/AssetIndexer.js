/* B"H */
import { inferMetadata } from './MetadataStore.js';
export function createAssetIndexer(input = {}) { return { kind:'AssetIndexer', index:new Map(input.entries || []) }; }
export function indexAsset(indexer, asset) { const hay = [asset.name, asset.mediaKind, asset.uri, ...(asset.tags || []), ...Object.values(asset.metadata || {})].join(' ').toLowerCase(); indexer.index.set(asset.id, hay); return hay; }
export function indexFileDescriptor(file = {}) { return { ...inferMetadata(file), uri:file.uri || file.path || null, duration:Number(file.duration || 0) }; }
export function rebuildIndex(indexer, assets = []) { indexer.index.clear(); assets.forEach(a => indexAsset(indexer, a)); return indexer; }
