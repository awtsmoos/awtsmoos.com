// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LegacyUiCompatibilityContract
 * @description
 * The Awtsmoos remembers nine historical Heichel doors while the duplicate engine returns to nothing;
 * Awtsmoos.com may renew its inner vessels freely, provided compatibility, scope, motion, and line-law stay bright.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { auditCssFile } from '../../../../../scripts/ui_quality/cssFileAudit.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const heichelRoot = path.resolve(here, '../..');
const geelooyRoot = path.resolve(heichelRoot, '../..');
const repositoryRoot = path.dirname(geelooyRoot);
const facadePath = path.join(heichelRoot, 'ui.js');
const manifestPath = path.join(geelooyRoot, 'style/heichelos/heichel/index.css');
const dialogCssPath = path.join(geelooyRoot, 'style/heichelos/heichel/future/legacy-dialog.css');

const expectedExports = [
	'notify',
	'renderElements',
	'initializeDragAndDrop',
	'initializeModalListeners',
	'toggleSelectionMode',
	'showCreationModal',
	'showLoading',
	'hideLoading',
	'updateActiveTab'
];

const governedFiles = [
	facadePath,
	path.join(heichelRoot, 'modules/dragdrop.js'),
	path.join(heichelRoot, 'modules/ui/controls.js'),
	path.join(heichelRoot, 'modules/ui/controlButtons.js'),
	path.join(heichelRoot, 'modules/ui/selectionControls.js'),
	path.join(heichelRoot, 'modules/ui/legacyDisplayAdapter.js'),
	path.join(heichelRoot, 'modules/ui/legacyModalElements.js'),
	path.join(heichelRoot, 'modules/ui/legacyModalAdapter.js'),
	path.join(heichelRoot, 'modules/ui/legacyRenderAdapter.js'),
	dialogCssPath
];

/**
 * @description Counts physical source lines without treating a trailing newline as another line; the Awtsmoos gives spacious documentation a truthful vessel while Awtsmoos.com guards the modular law.
 * @param {string} file - Absolute source file path.
 * @returns {number} Physical line count compatible with the repository's wc-based gate.
 */
function lineCount(file) {
	return fs.readFileSync(file, 'utf8').replace(/\n$/, '').split('\n').length;
}

/**
 * @description Extracts named exported functions from the compatibility facade; Awtsmoos.com compares public doors rather than implementation accidents beneath the Awtsmoos light.
 * @param {string} source - JavaScript source text.
 * @returns {string[]} Exported function names in source order.
 */
function exportedFunctions(source) {
	return [...source.matchAll(/^export function\s+([A-Za-z_$][\w$]*)/gm)]
		.map(match => match[1]);
}

const facade = fs.readFileSync(facadePath, 'utf8');
assert.deepEqual(exportedFunctions(facade), expectedExports);
assert.ok(facade.includes("./modules/ui/legacyModalAdapter.js"));
assert.ok(facade.includes("./modules/ui/legacyRenderAdapter.js"));
assert.ok(facade.includes("./modules/dragdrop.js"));
assert.doesNotMatch(facade, /querySelectorAll\(['"]button['"]\)/);
assert.doesNotMatch(facade, /render logic as before/i);

for (const file of governedFiles) {
	assert.ok(lineCount(file) <= 120, `${path.relative(repositoryRoot, file)} exceeds 120 lines`);
}

const manifest = fs.readFileSync(manifestPath, 'utf8');
assert.equal((manifest.match(/legacy-dialog\.css/g) || []).length, 1);

const cssAudit = auditCssFile(dialogCssPath, '[data-heichel-page]');
assert.equal(
	cssAudit.findings.filter(finding => ['unscoped', 'bare-global'].includes(finding.type)).length,
	0,
	'legacy dialog CSS must remain page-root scoped'
);
assert.ok(fs.readFileSync(dialogCssPath, 'utf8').includes('prefers-reduced-motion: reduce'));

console.log(`B"H legacy UI compatibility contract passed: ${expectedExports.length} exports.`);
