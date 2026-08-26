//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos gives every finger-command a complete bounded vessel;
 * Awtsmoos.com verifies modular Shema touch UI retracts beneath menus and never rebuilds a six-button trailing row.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

function source(relativePath) {
	return readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}

const controls = source('../css/base/controls.css');
const layout = source('../css/touch/layout.css');
const interaction = source('../css/touch/interaction.css');
const responsive = source('../css/touch/responsive.css');
const modules = [
	'../css/base.css', '../css/base/foundation.css', '../css/base/controls.css',
	'../css/base/surface.css', '../css/base/accessibility.css', '../css/touch.css',
	'../css/touch/layout.css', '../css/touch/interaction.css', '../css/touch/responsive.css'
];

test('generic buttons provide complete hover, focus, and press language', () => {
	assert.match(controls, /appearance:\s*none/);
	assert.match(controls, /:focus-visible/);
	assert.match(controls, /button:active/);
	assert.match(controls, /button:hover/);
});

test('touch dock is compact and action controls form a 2x2 portrait grid', () => {
	assert.match(layout, /grid-template-columns:\s*max-content max-content/);
	assert.match(layout, /\.action-cluster\s*\{[\s\S]*repeat\(2, var\(--touch-unit\)\)/);
	assert.doesNotMatch(layout, /\.attack-touch\s*\{[\s\S]{0,180}(width|inline-size):\s*clamp/);
});

test('touch buttons reset native appearance and expose every interaction state', () => {
	assert.match(layout, /appearance:\s*none/);
	assert.match(interaction, /button:focus-visible/);
	assert.match(interaction, /button:active/);
	assert.match(interaction, /button\.active/);
	assert.match(interaction, /button:hover/);
});

test('gameplay touch controls retract beneath every visible overlay', () => {
	assert.match(responsive, /\.overlay\.visible\s*~\s*\.touch-controls\s*\{[\s\S]*display:\s*none\s*!important/);
});

test('narrow portrait and short landscape receive explicit containment', () => {
	assert.match(responsive, /@media \(max-width:\s*340px\)/);
	assert.match(responsive, /@media \(max-height:\s*500px\) and \(orientation:\s*landscape\)/);
	assert.match(responsive, /repeat\(4, var\(--touch-unit\)\)/);
});

test('all touched touch UI modules remain small', () => {
	for (const path of modules) {
		const lines = source(path).split(/\r?\n/).length;
		assert.ok(lines <= 120, `${path} exceeds 120 lines`);
	}
});
