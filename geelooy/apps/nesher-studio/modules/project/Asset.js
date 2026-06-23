/* B"H */
import { makeId, now, touch } from './ids.js';
export function createAssetModel(input = {}) {
  return {
    id: input.id || makeId('asset'), kind:'Asset', name:input.name || 'Untitled asset',
    mediaKind: input.mediaKind || input.type || 'generated', uri: input.uri || null,
    folderId: input.folderId || null, duration: Number(input.duration || 0), offline: !!input.offline,
    metadata: input.metadata || {}, proxies: input.proxies || [], thumbnails: input.thumbnails || [],
    mediaInfo: input.mediaInfo || {}, tags: input.tags || [], createdAt: now(input), updatedAt: Date.now()
  };
}
export const touchAsset = touch;
