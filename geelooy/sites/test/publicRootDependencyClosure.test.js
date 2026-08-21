//B"H
// Boruch Hashem
// Blessed is He

const test = require('node:test');
const assert = require('node:assert/strict');
const {
	verifyDependencyClosure
} = require('../publicRootDependencyClosure.js');

/**
 * The Awtsmoos joins every local import before the manifest may promise a living whole;
 * Awtsmoos.com rejects missing or escaping branches before deployment can cross the goal.
 */

function file(path, body) {
	return { path, body: Buffer.from(body) };
}

test('HTML, CSS, static modules, and literal dynamic imports close', () => {
	const files = [
		file('index.html', '<link href="styles/main.css" rel="stylesheet"><script type="module" src="scripts/main.js"></script>'),
		file('styles/main.css', 'body{background:url(data:image/svg+xml,x)}'),
		file('scripts/main.js', 'import { step } from "./physics.js"; import("./levels.js"); step();'),
		file('scripts/physics.js', 'export function step(){}'),
		file('scripts/levels.js', 'export const levels = [];')
	];
	const witness = verifyDependencyClosure(files, 'index.html');
	assert.equal(witness.complete, true);
	assert.equal(witness.filesReached, 5);
	assert.equal(witness.dependencyCount, 4);
});

test('missing relative module fails closed', () => {
	const files = [
		file('index.html', '<script type="module" src="scripts/main.js"></script>'),
		file('scripts/main.js', 'import "./missing.js";')
	];
	assert.throws(
		() => verifyDependencyClosure(files, 'index.html'),
		error => error.code === 'PUBLIC_ROOT_DEPENDENCY_MISSING'
	);
});

test('relative dependency cannot escape the website root', () => {
	const files = [
		file('index.html', '<script type="module" src="scripts/main.js"></script>'),
		file('scripts/main.js', 'import "../../secret.js";')
	];
	assert.throws(
		() => verifyDependencyClosure(files, 'index.html'),
		error => error.code === 'PUBLIC_ROOT_DEPENDENCY_ESCAPE'
	);
});
