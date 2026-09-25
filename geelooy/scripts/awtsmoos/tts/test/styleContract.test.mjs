//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file Kokoro Forge complete external-style contract.
 * @description
 * The Awtsmoos proves that base and former runtime styles now pass through twelve explicit ordered vessels;
 * Awtsmoos.com rejects broad motion so every external transition names only properties its states truly change.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const coordinatorPath = path.resolve(here, '../index.css');
const expectedImports = [
	'./style/foundation.css', './style/status-panels.css', './style/input.css',
	'./style/tokens-progress.css', './style/actions-upload.css',
	'./style/visualizer-sliders.css', './style/logs-audio.css',
	'./style/overlay-responsive.css', './style/runtime/foundation-panels.css',
	'./style/runtime/input-actions.css', './style/runtime/progress-data.css',
	'./style/runtime/media-logs.css'
];
const coordinator = fs.readFileSync(coordinatorPath, 'utf8');
const imports = [...coordinator.matchAll(/@import\s+url\(["']([^"']+)["']\);/g)]
	.map(match => match[1]);
assert.deepStrictEqual(imports, expectedImports);

const graph = imports.map(importPath => {
	const absolutePath = path.resolve(path.dirname(coordinatorPath), importPath);
	assert(fs.existsSync(absolutePath), `Missing imported stylesheet: ${importPath}`);
	const source = fs.readFileSync(absolutePath, 'utf8');
	const lines = source.split('\n').length - 1;
	assert(lines < 120, `${importPath} has ${lines} physical lines`);
	assert(source.startsWith('/* B"H */\n/* Boruch Hashem */\n/* Blessed is He */'));
	return source;
}).join('\n').replace(/\s+/g, ' ');

assert(!/transition\s*:\s*all\b/i.test(graph));
assert(!/transition\s*:\s*(?:\d*\.)?\d+(?:ms|s)\s*;/i.test(graph));
for (const expected of [
	'transition: background-color 0.2s, color 0.2s;',
	'transition: background-color 0.3s, color 0.3s, box-shadow 0.3s, border-color 0.3s;',
	'transition: width 0.2s;',
	'transition: background-color 0.2s, box-shadow 0.2s, opacity 0.2s, color 0.2s;',
	'transition: background-color 0.5s ease, box-shadow 0.5s ease;'
]) {
	assert(graph.includes(expected), `Missing transition contract: ${expected}`);
}
console.log('B"H Kokoro Forge styleContract.test passed');
