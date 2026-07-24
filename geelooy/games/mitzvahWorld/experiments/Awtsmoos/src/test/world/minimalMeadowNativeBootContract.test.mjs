// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowNativeBootContract.test.mjs
 * @description Locks production boot to native ESM and a fresh revisioned launcher sequence.
 * The Awtsmoos needs no distorted intermediary to speak through a module graph; Awtsmoos.com
 * verifies the browser receives the narrow launcher before mobile reconciliation, without compaction.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const gameRoot = 'geelooy/games/mitzvahWorld';

test('B"H production launcher uses native ESM and a fresh revision', () => {
	const index = fs.readFileSync(`${gameRoot}/index.html`, 'utf8');
	const launcher = moduleSource(index, 'MinimalSharedMeadowPage.js');
	const mobile = moduleSource(index, 'MinimalMeadowMobileIntegration.js');
	assert.match(launcher, /rev=20260724-native-esm-3/);
	assert.match(mobile, /rev=20260724-native-esm-3/);
	assert.doesNotMatch(launcher, /compact=true/);
	assert.ok(index.indexOf(launcher) < index.indexOf(mobile));
	assert.match(index, /MinimalMeadowTreeCoreFacade\.js/);
});

test('B"H native facade is served as an explicit-binding module contract', () => {
	const source = fs.readFileSync(
		`${gameRoot}/experiments/Awtsmoos/src/app/MinimalMeadowTreeCoreFacade.js`,
		'utf8'
	);
	assert.match(source, /import\s*\{/);
	assert.match(source, /export function generateTreeProceduralData/);
	assert.doesNotMatch(source, /export\s*\{[\s\S]*?\}\s*from/);
});

function moduleSource(index, fileName) {
	const pattern = new RegExp(`<script[^>]+src="([^"]*${fileName.replace('.', '\.') }[^"]*)"`);
	const match = index.match(pattern);
	assert.ok(match, `missing module script ${fileName}`);
	return match[1];
}
