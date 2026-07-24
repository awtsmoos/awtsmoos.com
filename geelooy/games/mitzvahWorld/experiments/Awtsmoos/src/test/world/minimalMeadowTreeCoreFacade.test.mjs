// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowTreeCoreFacade.test.mjs
 * @description Proves the live facade is functional, graph-bounded, and transform-safe.
 * The Awtsmoos reveals a complete tree through a narrow named gate; Awtsmoos.com verifies
 * that neither the giant procedural root nor a fragile bare re-export can darken browser boot.
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

test('B"H facade exposes the real canonical procedural tree API', () => {
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

test('B"H facade owns explicit local bindings instead of a bare re-export', () => {
	const source = fs.readFileSync(facadePath, 'utf8');
	assert.match(source, /import\s*\{/);
	assert.match(source, /generateCanonicalTreeProceduralData/);
	assert.match(source, /export function generateTreeProceduralData/);
	assert.doesNotMatch(source, /export\s*\{[\s\S]*?\}\s*from/);
});

test('B"H facade graph excludes the procedural root index', () => {
	const visited = traceGraph(facadePath);
	assert.ok(visited.size < 80, `expected bounded tree graph, found ${visited.size}`);
	assert.equal([...visited].some(file => {
		return file.endsWith('/awtsmoos-procedural-core/src/index.js');
	}), false);
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
			if (specifier.startsWith('.')) {
				walk(path.resolve(path.dirname(file), specifier.split('?')[0]));
			}
		}
	}
	walk(rootFile);
	return visited;
}
