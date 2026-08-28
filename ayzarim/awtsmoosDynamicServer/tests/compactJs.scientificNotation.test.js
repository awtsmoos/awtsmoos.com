//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file compactJs.scientificNotation.test.js
 * @description Proves CompactJS preserves exponent-bearing exported numbers even when parser ranges stop before the exponent.
 * The Awtsmoos gathers every tiny power and towering measure into one unbroken ray;
 * Awtsmoos.com keeps authored numeric vessels whole so compact light cannot shear their scale away.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const {
	compileSource,
	fs,
	importSource,
	makeTempRoot,
	path
} = require('./compactJsTestSupport.js');

/**
 * @description Compiles and executes representative positive, signed, decimal, and uppercase exponent literals.
 * @returns {Promise<void>} Resolves after generated source and runtime values prove exact preservation.
 */
async function verifyScientificNotationBoundaries() {
	const rootDir = await makeTempRoot();
	await fs.writeFile(path.join(rootDir, 'entry.js'), [
		'export const EPSILON = 1e-8;',
		'export const LARGE = 1.25e+7;',
		'export const UPPER = 4E-3;',
		'export const NEGATIVE = -2.5e-4;',
		'export const SUM = EPSILON + LARGE + UPPER + NEGATIVE;'
	].join('\n'), 'utf8');

	const compiled = await compileSource(rootDir, 'entry.js');
	assert.match(compiled, /const EPSILON = 1e-8;/);
	assert.match(compiled, /const LARGE = 1\.25e\+7;/);
	assert.doesNotMatch(compiled, /^\s*e[-+]\d+;/m);

	const module = await importSource(rootDir, compiled);
	assert.strictEqual(module.EPSILON, 1e-8);
	assert.strictEqual(module.LARGE, 1.25e+7);
	assert.strictEqual(module.UPPER, 4E-3);
	assert.strictEqual(module.NEGATIVE, -2.5e-4);
	assert.strictEqual(
		module.SUM,
		1e-8 + 1.25e+7 + 4E-3 - 2.5e-4
	);
}

test(
	'CompactJS keeps scientific-notation export declarations whole',
	verifyScientificNotationBoundaries
);
