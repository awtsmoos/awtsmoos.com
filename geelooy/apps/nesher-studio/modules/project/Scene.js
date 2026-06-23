/* B"H */
import { makeId, now, touch } from './ids.js';
export function createSceneModel(input = {}) {
  return {
    id: input.id || makeId('scene'), kind:'Scene', name: input.name || 'Scene',
    sourceIds: input.sourceIds || input.sources?.map?.(s => s.id) || [], sources: input.sources || [],
    audioBus: input.audioBus || 'master', filters: input.filters || [], transitions: input.transitions || [],
    parentSceneId: input.parentSceneId || null, createdAt: now(input), updatedAt: Date.now()
  };
}
export const touchScene = touch;
