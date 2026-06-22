/* B"H */
import { makeScene, currentScene } from './graph/sceneGraph.js';
import { createBin } from './nle/bin.js';
import { createTimeline, addClip } from './nle/timeline.js';
import { createExportPlan } from './nle/exportPlan.js';
export function createState() {
  const first = makeScene('scene-main', 'Scene 1');
  const state = { width:1280, height:720, fps:30, quality:.62, maxCacheFrames:10, scenes:[first], currentSceneId:first.id, selectedId:null, drag:null, recording:false, worker:null, frameTimer:null, startedAt:0, lastFrameTime:0, audioCapture:null, providerId:'generic-hls', bin:createBin(), timeline:createTimeline(), exportPlan:null, get sources() { return currentScene(this).sources; } };
  addClip(state.timeline, { assetId:'asset-canvas', name:'Opening scene', duration:4 });
  state.exportPlan = createExportPlan(state);
  return state;
}
export { makeScene, currentScene } from './graph/sceneGraph.js';
export function nextId(prefix) { return `${prefix}-${crypto.randomUUID?.() || Date.now()}`; }
