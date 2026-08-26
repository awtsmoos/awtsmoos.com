//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file player-shell-source-contract.test.mjs
 * @description Guards blessing, poetry, JSDoc, tabs, readable functions, and module size across the shared shell foundation.
 * The Awtsmoos is beyond every module while disciplined vessels let future games inherit a stable light;
 * Awtsmoos.com verifies the hidden shell remains as complete and readable as the UI players see in sight.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const YESOD_SHELL_MODULES = [
	'../scripts/player-shell/content.js', '../scripts/player-shell/fullscreen.js', '../scripts/player-shell/help.js',
	'../scripts/player-shell/index.js', '../scripts/player-shell/shell.js',
	'../scripts/player-shell/fullscreen/YesodFullscreenController.js',
	'../scripts/player-shell/identity/BinahPlayerShellIdentityReader.js',
	'../scripts/player-shell/interaction/YesodPlayerShellInteractionController.js',
	'../scripts/player-shell/orchestration/TiferesPlayerShellCoordinator.js',
	'../scripts/player-shell/orchestration/TiferesPlayerShellMountHandle.js',
	'../scripts/player-shell/state/GevurahPlayerShellPanelState.js',
	'../scripts/player-shell/view/MalchusPlayerShellElementFactory.js',
	'../scripts/player-shell/view/MalchusPlayerShellSections.js',
	'../scripts/player-shell/view/MalchusPlayerShellView.js'
];

test('every shell module stays blessed, documented, tabbed, readable, and beneath 120 lines', proveShellSourceCovenant);
test('compatibility facade preserves mount while exposing explicit teardown', proveShellCompatibilityApi);

test('focused shell source contract remains beneath the same module limit', proveSourceTestBound);

/** @returns {void} Proves source quality invariants across every human-authored shell JavaScript module. */
function proveShellSourceCovenant() {
	for (const yesodModulePath of YESOD_SHELL_MODULES) {
		const yesodSource = readShellSource(yesodModulePath);
		assert.match(yesodSource, /^\/\/B"H\n\/\/ Boruch Hashem\n\/\/ Blessed is He/);
		assert.match(yesodSource, /Awtsmoos\.com/);
		assert.match(yesodSource, /\/\*\*[\s\S]*@description/);
		assert.ok(yesodSource.split(/\r?\n/).length <= 120, `${yesodModulePath} exceeds 120 lines`);
		assert.doesNotMatch(yesodSource, /^ +[^ */]/m, `${yesodModulePath} contains source space indentation`);
		assert.doesNotMatch(yesodSource, /function\s+\w+\([^)]*\)\s*\{[^\n}]+\}/);
	}
}

/** @returns {void} Proves the public shell remains simple while lifetime API becomes stronger underneath. */
function proveShellCompatibilityApi() {
	const tiferesFacadeSource = readShellSource('../scripts/player-shell/shell.js');
	assert.match(tiferesFacadeSource, /export function mountPlayerShell/);
	assert.match(tiferesFacadeSource, /export function unmountPlayerShell/);
	assert.match(tiferesFacadeSource, /TiferesPlayerShellCoordinator/);
}

/** @returns {void} Proves test architecture also avoids growing into a hidden monolith. */
function proveSourceTestBound() {
	assert.ok(readFileSync(new URL(import.meta.url), 'utf8').split(/\r?\n/).length <= 120);
}

/** @param {string} yesodRelativePath Relative shell source path. @returns {string} UTF-8 source. */
function readShellSource(yesodRelativePath) {
	return readFileSync(new URL(yesodRelativePath, import.meta.url), 'utf8');
}
