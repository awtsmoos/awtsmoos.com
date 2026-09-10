//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file nitzotz-renderer-fallback-contract.test.mjs
 * @description Proves Nitzotz remains visibly playable when WebGL allocation is
 * denied, rather than allowing renderer capability to become a boot requirement.
 *
 * Contract invariants:
 * - WebGL denial selects a named Canvas2D compatibility renderer.
 * - The fallback can render canonical-shaped world/player/object state without error.
 * - WebGL-only diagnostics are optional and cannot crash fallback inspection.
 * - All touched production vessels remain small, documented, and explicitly blessed.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { createRenderer } from '../nitzotz-io/js/renderer.js';

const productionModules = [
	'../nitzotz-io/js/renderer.js',
	'../nitzotz-io/js/render/compatibility2d.js',
	'../nitzotz-io/js/render/compatibility2d-scene.js',
	'../nitzotz-io/js/render/compatibility2d-marks.js',
	'../nitzotz-io/js/debug/sample.js'
];

/** Read one production module relative to this permanent Games contract. */
function source(relativePath) {
	return readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}

/** Create the smallest Canvas2D surface required by the compatibility renderer. */
function fakeCanvas() {
	const context = {
		save() {},
		restore() {},
		fillRect() {},
		beginPath() {},
		moveTo() {},
		lineTo() {},
		stroke() {},
		arc() {},
		fill() {},
		fillText() {}
	};
	return {
		width: 0,
		height: 0,
		clientWidth: 390,
		clientHeight: 844,
		getContext(type) {
			if (type === 'webgl') {
				return null;
			}
			return type === '2d' ? context : null;
		}
	};
}

/** Construct canonical-shaped state without depending on storage or network services. */
function fakeWorld() {
	return {
		mode: 'playing',
		player: { x: 0, y: 0, r: 24 },
		level: {
			objects: [
				{ x: 80, y: 40, r: 18, color: [0.4, 0.8, 1], taken: false },
				{ x: -120, y: 60, r: 26, color: [1, 0.7, 0.2], power: 'surge', taken: false }
			]
		}
	};
}

test('WebGL denial degrades to a playable Canvas2D renderer', () => {
	const canvas = fakeCanvas();
	const renderer = createRenderer(canvas);
	assert.equal(renderer.kind, 'canvas2d-compatibility');
	assert.equal(renderer.gl, null);
	assert.match(renderer.compatibilityReason, /WebGL unavailable/i);
	assert.doesNotThrow(() => renderer.render(fakeWorld()));
	assert.ok(canvas.width > 0);
	assert.ok(canvas.height > 0);
});

test('fallback diagnostics never require a WebGL context', () => {
	const sample = source('../nitzotz-io/js/debug/sample.js');
	assert.match(sample, /renderer:\s*renderer\.kind/);
	assert.match(sample, /compatibilityReason/);
	assert.match(sample, /renderer\.gl\?\.getError\?\.\(\)/);
});

test('touched renderer vessels obey the strict source law', () => {
	for (const modulePath of productionModules) {
		const text = source(modulePath);
		assert.match(text, /^\/\/B"H\n\/\/Boruch Hashem\n\/\/Blessed be He\n/);
		assert.match(text, /@file|@description/);
		assert.ok(text.split(/\r?\n/).length < 120, `${modulePath} reached 120 lines`);
		const spaceIndentedCode = text.split(/\r?\n/).filter(line => {
			return /^ +\S/.test(line) && !/^ +\*/.test(line);
		});
		assert.deepEqual(spaceIndentedCode, [], `${modulePath} contains space-indented code`);
	}
});
