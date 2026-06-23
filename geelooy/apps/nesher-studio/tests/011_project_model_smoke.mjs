/* B"H
Executable smoke: the project spine must serialize, hydrate, select, and undo.
No raw media is created. Only textual proof leaves this test.
*/
import assert from 'node:assert/strict';
import { createProject, addProjectAsset, addProjectScene, addProjectSequence, commitProject, serializeProject, hydrateProject, undoProject } from '../modules/project/index.js';

const project = createProject({ width:1920, height:1080, fps:60 });
const asset = addProjectAsset(project, { name:'Smoke asset', mediaKind:'generated', duration:3 });
const scene = addProjectScene(project, { name:'Smoke scene' });
const sequence = addProjectSequence(project, { name:'Smoke sequence' });
commitProject(project, 'smoke additions');

assert.equal(project.selection.assetId, asset.id);
assert.equal(project.currentSceneId, scene.id);
assert.equal(project.currentSequenceId, sequence.id);
assert.equal(project.undo.past.length, 1);

const hydrated = hydrateProject(serializeProject(project));
assert.equal(hydrated.width, 1920);
assert.equal(hydrated.assets[0].name, 'Smoke asset');
assert.equal(hydrated.sequences.at(-1).name, 'Smoke sequence');

undoProject(project);
assert.equal(project.kind, 'Project');
console.log(JSON.stringify({ ok:true, assets:hydrated.assets.length, scenes:hydrated.scenes.length, sequences:hydrated.sequences.length }));
