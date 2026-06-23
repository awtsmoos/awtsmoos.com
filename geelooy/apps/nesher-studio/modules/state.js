/* B"H
Nesher state: one project object, still friendly to the existing stage UI.
The Awtsmoos hides the whole studio in this small vessel: scenes, sequences,
assets, bins, streaming, export, undo, and selection breathing as one.
*/
import { makeScene, currentScene } from './graph/sceneGraph.js';
import { createBin } from './nle/bin.js';
import { createTimeline, addClip } from './nle/timeline.js';
import { createExportPlan } from './nle/exportPlan.js';
import { createProject, addProjectAsset, addProjectSequence, commitProject } from './project/Project.js';

export function createState() {
  const first = makeScene('scene-main', 'Scene 1');
  const bin = createBin();
  const timeline = createTimeline();
  addClip(timeline, { assetId:'asset-canvas', name:'Opening scene', duration:4 });
  const project = createProject({ scenes:[first], width:1280, height:720, fps:30 });
  addProjectAsset(project, { id:'asset-canvas', name:'Opening scene', mediaKind:'generated', duration:4 });
  addProjectSequence(project, { id:'sequence-main', name:'Sequence 1' });
  project.currentSequenceId = 'sequence-main';
  const state = {
    project, width:project.width, height:project.height, fps:project.fps, quality:.62, maxCacheFrames:10,
    scenes:project.scenes, currentSceneId:project.currentSceneId, selectedId:null, drag:null,
    recording:false, worker:null, frameTimer:null, startedAt:0, lastFrameTime:0, audioCapture:null,
    providerId:project.streaming.providerId, bin, timeline, exportPlan:null,
    get sources() { return currentScene(this).sources; },
    get selection() { return project.selection; },
    commit(label = 'change') { return commitProjectState(this, label); }
  };
  state.exportPlan = createExportPlan(state);
  commitProjectState(state, 'initial state');
  return state;
}

export function syncProjectFromState(state) {
  state.project.width = state.width; state.project.height = state.height; state.project.fps = state.fps;
  state.project.scenes = state.scenes; state.project.currentSceneId = state.currentSceneId;
  state.project.streaming.providerId = state.providerId;
  state.project.selection.sourceId = state.selectedId;
  return state.project;
}

export function commitProjectState(state, label = 'change') {
  syncProjectFromState(state);
  commitProject(state.project, label);
  return state;
}

export { makeScene, currentScene } from './graph/sceneGraph.js';
export function nextId(prefix) { return `${prefix}-${crypto.randomUUID?.() || Date.now()}`; }
