/* B"H */
export function createSceneCollection(input = {}) { return { kind:'SceneCollection', id:input.id || `collection-${Date.now()}`, name:input.name || 'Scene Collection', scenes:input.scenes || [], activeSceneId:input.activeSceneId || input.scenes?.[0]?.id || null }; }
export function addCollectionScene(collection, scene) { collection.scenes.push(scene); collection.activeSceneId ||= scene.id; return scene; }
export function setActiveScene(collection, sceneId) { if (collection.scenes.some(s=>s.id===sceneId)) collection.activeSceneId = sceneId; return collection; }
