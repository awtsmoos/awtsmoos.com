// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowTreeCoreFacade.test.mjs
 * @description Proves the live tree facade is functional and graph-bounded.
 * The Awtsmoos reveals a complete tree through a narrow gate; Awtsmoos.com verifies that
 * the gate never reopens the giant procedural root which previously darkened playable boot.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {
	generateTreeProceduralData,
	listTreePresets
} from '../../app/MinimalMeadowTreeCoreFacade.js';

const facadePath = path.resolve(
	'geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/app/MinimalMeadowTreeCoreFacade.js'
);

test('facade exposes the real procedural tree API', () => {
	const presets = listTreePresets();
	assert.ok(presets.length > 3);
	assert.ok(presets.includes('Oak Medium'));
	const tree = generateTreeProceduralData('Oak Medium', {
		budget: { maxBranches: 24, maxLeaves: 48 },
		detail: 'low'
	});
	assert.ok(tree.branches);
	assert.ok(tree.leaves);
	assert.ok(tree.stats.generatedBranches > 0);
	assert.ok(tree.stats.branchVertices > 0);
	assert.ok(tree.stats.leafVertices > 0);
	assert.equal(tree.stats.drawCalls, 2);
});

test('facade graph excludes the procedural root index', () => {
	const visited = traceGraph(facadePath);
	assert.ok(visited.size < 80, `expected bounded tree graph, found ${visited.size}`);
	assert.equal(
		[...visited].some(file => {
			return file.endsWith('/awtsmoos-procedural-core/src/index.js');
		}),
		false
	);
});

function traceGraph(rootFile) {
	const visited = new Set();
	function walk(file) {
		if (visited.has(file)) {
			return;
		}
		assert.ok(fs.existsSync(file), `missing import ${file}`);
		visited.add(file);
		const source = fs.readFileSync(file, 'utf8');
		const pattern = /(?:import|export)\s+(?:[^'";]+?\s+from\s+)?['"]([^'"]+)['"]/g;
		for (const match of source.matchAll(pattern)) {
			const specifier = match[1];
			if (!specifier.startsWith('.')) {
				continue;
			}
			walk(path.resolve(path.dirname(file), specifier.split('?')[0]));
		}
	}
	walk(rootFile);
	return visited;
}
