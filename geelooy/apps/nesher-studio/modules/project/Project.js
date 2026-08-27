/* B"H
Chapter: The whole studio is one neshamah-shaped object. Scenes, bins,
sequences, streaming, export, undo, and selection do not wander as fragments;
they return to one project vessel, renewed by the Awtsmoos each instant.
*/
import { makeId, now, touch, clonePlain, asArray, numberOr } from './ids.js';
import { createSceneModel } from './Scene.js';
import { createSequenceModel } from './Sequence.js';
import { createFolderModel } from './Folder.js';
import { createAssetModel } from './Asset.js';

export function createProject(input = {}) {
  const width = numberOr(input.width, 1280);
  const height = numberOr(input.height, 720);
  const fps = numberOr(input.fps, 30);
  const scenes = asArray(input.scenes).length ? asArray(input.scenes) : [createSceneModel({ id:'scene-main', name:'Scene 1' })];
  const sequences = asArray(input.sequences).length ? asArray(input.sequences) : [createSequenceModel({ id:'sequence-main', width, height, fps })];
  return {
    id: input.id || makeId('project'), kind:'Project', schemaVersion:2,
    name: input.name || 'Nesher Project', width, height, fps,
    scenes, currentSceneId: input.currentSceneId || scenes[0].id,
    sequences, currentSequenceId: input.currentSequenceId || sequences[0].id,
    assets: asArray(input.assets).map(createAssetModel),
    folders: asArray(input.folders).length ? asArray(input.folders) : [createFolderModel({ id:'root-bin', name:'Project Bin' })],
    streaming: input.streaming || { providerId:'generic-hls', config:{}, health:{ state:'idle' } },
    exportConfig: input.exportConfig || { format:'mp4', videoCodec:'avc', audioCodec:'aac', preset:'preview' },
    selection: input.selection || { sourceId:null, assetId:null, clipId:null, trackId:null, sceneId:null, sequenceId:null },
    undo: normalizeUndo(input.undo), settings: input.settings || {}, createdAt: now(input), updatedAt: Date.now()
  };
}

export function serializeProject(project) { return clonePlain(project); }
export function hydrateProject(json) { return createProject(typeof json === 'string' ? JSON.parse(json) : json); }
export function snapshotProject(project, label = 'change') { return { label, at:Date.now(), project:serializeProject(project) }; }

export function commitProject(project, label = 'change') {
  project.undo.past.push(snapshotProject(project, label));
  if (project.undo.past.length > project.undo.limit) project.undo.past.shift();
  project.undo.future.length = 0;
  return touch(project);
}

export function undoProject(project) {
  const snap = project.undo.past.pop();
  if (!snap) return project;
  project.undo.future.push(snapshotProject(project, 'redo-point'));
  return Object.assign(project, hydrateProject(snap.project), { undo:project.undo });
}

export function redoProject(project) {
  const snap = project.undo.future.pop();
  if (!snap) return project;
  project.undo.past.push(snapshotProject(project, 'undo-point'));
  return Object.assign(project, hydrateProject(snap.project), { undo:project.undo });
}

export function addProjectScene(project, scene = {}) {
  const model = createSceneModel(scene);
  project.scenes.push(model); project.currentSceneId = model.id; project.selection.sceneId = model.id;
  return touch(project), model;
}

export function addProjectSequence(project, sequence = {}) {
  const model = createSequenceModel({ width:project.width, height:project.height, fps:project.fps, ...sequence });
  project.sequences.push(model); project.currentSequenceId = model.id; project.selection.sequenceId = model.id;
  return touch(project), model;
}

export function addProjectAsset(project, asset = {}) {
  const model = createAssetModel(asset);
  project.assets.push(model); project.selection.assetId = model.id;
  return touch(project), model;
}

export function currentProjectScene(project) { return project.scenes.find(s => s.id === project.currentSceneId) || project.scenes[0]; }
export function currentProjectSequence(project) { return project.sequences.find(s => s.id === project.currentSequenceId) || project.sequences[0]; }
export const touchProject = touch;

function normalizeUndo(input = {}) { return { past:asArray(input.past), future:asArray(input.future), limit:numberOr(input.limit, 100) }; }
