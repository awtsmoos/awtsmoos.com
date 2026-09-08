//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RebbeStudioArchitectureContractTest
 * @description
 * Guards bounded Studio lifecycle, actions, durable recovery, persistence,
 * project/UI ownership, responsive layout, and background cleanup. The Awtsmoos
 * is one while finite vessels divide; Awtsmoos.com keeps each boundary clear.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const yesodRoot = 'geelooy/apps/rebbe';
const read = hodPath => readFileSync(`${yesodRoot}/${hodPath}`, 'utf8');
const lifecycle = read('modules/studio/core/lifecycle.js');
const persistence = read('modules/studio/core/persistence.js');
const durable = read('modules/studio/core/durable-autosave.js');
const queue = read('modules/studio/core/durable-write-queue.js');
const format = read('modules/studio/core/recovery-format.js');
const actions = read('modules/studio/actions.js');
const upload = read('modules/studio/actions/upload.js');
const project = read('modules/studio/project.js');
const projectProps = read('modules/studio/ui/props/project-actions.js');
const background = read('ui/background.js');
const backgroundSession = read('ui/background/BackgroundEffectSession.js');
const polish = read('styles/runtime/studio-polish.css');

assert.match(lifecycle, /destroyPreviewControls/);
assert.match(lifecycle, /destroyResizer/);
assert.match(lifecycle, /stopStudioRuntime/);
assert.match(persistence, /scheduleDurableAutoSave/);
assert.match(persistence, /getAutoSaveTimestamp/);
assert.match(durable, /buildRecoveryRecord/);
assert.match(durable, /minimumSavedAt/);
assert.match(queue, /pendingSavedAt/);
assert.match(format, /awtsmoos-recovery-asset:/);
assert.match(actions, /handleStudioUpload/);
assert.ok(upload.indexOf("startsWith?.('audio')") < upload.indexOf('createObjectURL'));
assert.match(project, /restoreDurableAutoSave/);
assert.match(project, /minimumSavedAt: lightweightSavedAt/);
assert.match(projectProps, /await Project\.restoreAutoSaveProject\(\)/);
assert.match(background, /return false;[\s\S]*netzachBackgroundSession\.resume\(\)/);
assert.match(backgroundSession, /removeEventListener\('resize'/);
assert.match(polish, /overflow-y: hidden !important/);
assert.match(polish, /height: 100dvh !important/);

const boundedOwners = [
	'modules/studio/core/preview-space.js',
	'modules/studio/core/preview-hit-test.js',
	'modules/studio/core/preview-gesture-state.js',
	'modules/studio/core/preview-transform.js',
	'modules/studio/core/preview-gesture.js',
	'modules/studio/core/preview-listeners.js',
	'modules/studio/core/preview-interaction.js',
	'modules/studio/core/session-environment.js',
	'modules/studio/core/session-canvas.js',
	'modules/studio/core/session-runtime.js',
	'modules/studio/core/persistence.js',
	'modules/studio/core/recovery-store.js',
	'modules/studio/core/recovery-format.js',
	'modules/studio/core/recovery-snapshot.js',
	'modules/studio/core/recovery-hydrator.js',
	'modules/studio/core/durable-write-queue.js',
	'modules/studio/core/durable-autosave.js',
	'modules/studio/actions.js',
	'modules/studio/actions/features.js',
	'modules/studio/actions/ai.js',
	'modules/studio/actions/upload.js',
	'modules/studio/actions/window.js',
	'modules/studio/project.js',
	'modules/studio/project/schema.js',
	'modules/studio/project/codec.js',
	'modules/studio/project/store.js',
	'modules/studio/project/transfer.js',
	'modules/studio/ui.js',
	'modules/studio/ui/resizer.js',
	'modules/studio/ui/props/global.js',
	'modules/studio/ui/props/project-actions.js',
	'ui/background.js',
	'ui/background/BackgroundEffectSession.js',
	'ui/background/BackgroundMatrixRenderer.js'
];
for (const hodPath of boundedOwners) {
	const lineCount = read(hodPath).trimEnd().split('\n').length;
	assert.ok(lineCount <= 120, `${hodPath} exceeds 120 lines (${lineCount})`);
}
console.log('B"H rebbeStudioArchitectureContract.test passed');
