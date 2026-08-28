//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file loadingVisualContract.test.cjs
 * @description Guards authored loading motion, layered surfaces, reduced-motion mercy, and the real minimap touch floor without inspecting generated CSS.
 * The Awtsmoos shines before any bundle is born; Awtsmoos.com therefore tests the authored spring itself,
 * so gradients, motion, stillness, and forty-eight-pixel action vessels remain true before generated rivers swell.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const ROOT = path.resolve(__dirname, '..');
const SOURCE = path.join(ROOT, 'styles/source');
const UI = path.join(ROOT, 'experiments/Awtsmoos/src/ui');

function authored(relativePath) {
	return fs.readFileSync(path.join(SOURCE, relativePath), 'utf8');
}

function assertNoFlatBackground(source, label) {
	assert.doesNotMatch(
		source,
		/background\s*:\s*(?:#[0-9a-f]{3,8}|rgba?\()/i,
		`${label} must not use a flat solid background declaration`
	);
}

test('B"H loading source uses layered gradients and authored motion', () => {
	const base = authored('fragments/mitzvah-world-loading-001.css');
	const motion = authored('fragments/mitzvah-world-loading-002.css');
	const shell = authored('fragments/mitzvah-world-menu-shell-001.css');

	for (const [label, source] of [['base', base], ['motion', motion], ['shell', shell]]) {
		assertNoFlatBackground(source, label);
	}
	assert.ok((base.match(/radial-gradient\(/g) || []).length >= 4);
	assert.ok((base.match(/linear-gradient\(/g) || []).length >= 3);
	assert.match(motion, /@keyframes mw-loading-aurora/);
	assert.match(motion, /@keyframes mw-loading-card-arrival/);
	assert.match(motion, /@keyframes mw-loading-progress-glow/);
	assert.match(motion, /prefers-reduced-motion:\s*reduce/);
	assert.match(motion, /animation:\s*none/);
	assert.ok((shell.match(/radial-gradient\(/g) || []).length >= 4);
});

test('B"H production minimap authored sources keep a forty-eight-pixel action floor', () => {
	const imports = authored('imports-001.css');
	const controls = authored('fragments/mitzvah-world-actions-003-minimap-controls.css');
	const layout = fs.readFileSync(path.join(UI, 'WorldMinimapLayoutCss.js'), 'utf8');

	assert.match(imports, /mitzvah-world-actions-003-minimap-controls\.css/);
	assert.match(controls, /min-width:\s*48px/);
	assert.match(controls, /min-height:\s*48px/);
	assert.match(layout, /min-width:\s*48px/);
	assert.match(layout, /min-height:\s*48px/);
});
