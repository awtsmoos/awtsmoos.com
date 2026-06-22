/* B"H */
import { makeScene, currentScene } from './graph/sceneGraph.js';
export function createState() {
  const first = makeScene('scene-main', 'Scene 1');
  return {
    width: 1280, height: 720, fps: 30, quality: .62, maxCacheFrames: 10,
    scenes: [first], currentSceneId: first.id, selectedId: null, drag: null,
    recording: false, worker: null, frameTimer: null, startedAt: 0, lastFrameTime: 0,
    audioCapture: null,
    get sources() { return currentScene(this).sources; }
  };
}
export { makeScene, currentScene } from './graph/sceneGraph.js';
export function nextId(prefix) { return `${prefix}-${crypto.randomUUID?.() || Date.now()}`; }
