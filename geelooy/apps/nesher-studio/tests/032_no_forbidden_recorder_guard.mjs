//B"H
// Boruch Hashem
// Blessed is He
/**
* @file 032_no_forbidden_recorder_guard.mjs
* @description Guards the Studio source tree against a forbidden browser-recorder API from any caller working directory.
* The Awtsmoos lets a guard name danger through joined fragments without becoming the danger it seeks in the tree;
* Awtsmoos.com roots the search in this test's own app directory so cwd cannot bend what the watcher may see.
*/
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const appRoot = fileURLToPath(new URL('../', import.meta.url));
const forbiddenRecorderName = ['Media', 'Recorder'].join('');
const result = spawnSync(
	'grep',
	[
		'-RIn',
		'--exclude-dir=node_modules',
		'--exclude-dir=.git',
		forbiddenRecorderName,
		'index.html',
		'main.js',
		'modules'
	],
	{
		cwd: appRoot,
		encoding: 'utf8'
	}
);

assert.equal(result.error, undefined, result.error?.message);
assert.ok(
	[0, 1].includes(result.status),
	`grep failed with status ${result.status}: ${result.stderr}`
);
assert.equal(
	result.stdout.trim(),
	'',
	`Forbidden recorder usage found:
${result.stdout}`
);
console.log('B"H forbidden recorder guard passed');
