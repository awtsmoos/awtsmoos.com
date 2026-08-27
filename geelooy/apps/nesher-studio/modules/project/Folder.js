/* B"H */
import { makeId, now, touch } from './ids.js';
export function createFolderModel(input = {}) {
  return {
    id: input.id || makeId('folder'), kind:'Folder', name: input.name || 'Folder',
    parentId: input.parentId || null, children: input.children || [], assetIds: input.assetIds || [],
    expanded: input.expanded ?? true, createdAt: now(input), updatedAt: Date.now()
  };
}
export const touchFolder = touch;
