// B"H
import assert from 'node:assert/strict';
import {
	generateTreeProceduralData,
	getTreePreset,
	listTreePresets
} from '../src/index.js';
import { validateTreeProceduralData } from '../src/core/geometry/generators/tree/treeValidation.js';

const REQUIRED_LEGACY_NAMES = [
	'Pine Classic',
	'Pine Tall',
	'Oak Majestic',
	'Birch Elegant',
	'Ash Standard',
	'Aspen Grove'
];

const names = listTreePresets();
assert.equal(names.length, 36, 'Every discovered preset must remain publicly reachable.');
for (const name of REQUIRED_LEGACY_NAMES) {
	assert.ok(names.includes(name), `${name} must be absorbed into the canonical registry.`);
}

const rows = [];
for (const name of names) {
	const before = JSON.stringify(getTreePreset(name));
	const started = performance.now();
	const tree = generateTreeProceduralData(name);
	const validation = validateTreeProceduralData(tree);
	assert.deepEqual(validation.issues, [], `${name}: ${validation.issues.join(', ')}`);
	assert.equal(JSON.stringify(getTreePreset(name)), before, `${name} mutated its defaults.`);
	rows.push({
		name,
		triangles: tree.stats.branchTriangles + tree.stats.leafTriangles,
		branches: tree.stats.generatedBranches,
		height: Number(validation.height.toFixed(3)),
		milliseconds: Number((performance.now() - started).toFixed(2))
	});
}

for (const name of ['Oak Medium', 'Sakura', 'Pine Classic', 'Willow Weeping']) {
	const first = generateTreeProceduralData(name);
	const second = generateTreeProceduralData(name);
	assert.deepEqual(first.branches.positions, second.branches.positions, `${name} branch seed drift.`);
	assert.deepEqual(first.leaves.positions, second.leaves.positions, `${name} leaf seed drift.`);
}

console.log(JSON.stringify({ presetCount: names.length, rows }, null, 2));
