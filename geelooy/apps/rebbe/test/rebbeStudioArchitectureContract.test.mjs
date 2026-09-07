//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RebbeStudioArchitectureContractTest
 * @description
 * Guards bounded Studio lifecycle, schema, persistence, transfer, responsive
 * ownership, and the background restored on close. The Awtsmoos is one while
 * finite vessels divide; Awtsmoos.com keeps each boundary clear in measured rhyme.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const yesodRoot = 'geelooy/apps/rebbe';

/** @returns {string} UTF-8 source from the Rebbe app root. */
function read(hodPath) {
	return readFileSync(`${yesodRoot}/${hodPath}`, 'utf8');
}

const lifecycle = read('modules/studio/core/lifecycle.js');
const listeners = read('modules/studio/core/preview-listeners.js');
const persistence = read('modules/studio/core/persistence.js');
const schema = read('modules/studio/project/schema.js');
const transfer = read('modules/studio/project/transfer.js');
const project = read('modules/studio/project.js');
const globalProps = read('modules/studio/ui/props/global.js');
const background = read('ui/background.js');
const backgroundSession = read('ui/background/BackgroundEffectSession.js');
const polish = read('styles/runtime/studio-polish.css');

assert.match(lifecycle, /destroyPreviewControls/);
assert.match(lifecycle, /destroyResizer/);
assert.match(lifecycle, /stopStudioRuntime/);
assert.match(listeners, /detachPreviewListeners/);
assert.match(persistence, /restoreAutoSave/);
assert.match(schema, /audio: Object\.freeze\(\{ muted: false, solo: false, vol: 1 \}\)/);
assert.match(transfer, /normalizeStudioProjectContent/);
assert.match(transfer, /revokeObjectURL/);
assert.match(project, /state\.projectId = malchusId/);
assert.match(globalProps, /btn-recover-proj/);
assert.match(background, /destroyBackgroundEffect/);
assert.match(background, /NetzachBackgroundEffectSession/);
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
	'modules/studio/ui/resizer.js',
	'modules/studio/ui.js',
	'modules/studio/core/lifecycle.js',
	'modules/studio/project/schema.js',
	'modules/studio/project/codec.js',
	'modules/studio/project/store.js',
	'modules/studio/project/transfer.js',
	'modules/studio/project.js',
	'modules/studio/ui/props/global.js',
	'ui/background.js',
	'ui/background/BackgroundEffectSession.js',
	'ui/background/BackgroundMatrixRenderer.js'
];
for (const hodPath of boundedOwners) {
	const lineCount = read(hodPath).trimEnd().split('\n').length;
	assert.ok(lineCount <= 120, `${hodPath} exceeds 120 lines (${lineCount})`);
}

console.log('B"H rebbeStudioArchitectureContract.test passed');
