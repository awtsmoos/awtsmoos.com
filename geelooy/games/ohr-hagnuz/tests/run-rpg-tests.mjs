/**
 * B"H
 * @module run-rpg-tests
 * @description Runs every RPG regression in isolation and refuses false green completion.
 *
 * Each test is a separate vessel. The Awtsmoos renews every instant, while
 * this runner preserves the earthly obligation that one broken vessel makes
 * the suite honestly red instead of letting a later success conceal it.
 */
import { readdirSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const testDirectories = [
	{ path: join(projectRoot, 'tests', 'rpg'), suffix: '.test.mjs' },
	{ path: join(projectRoot, 'src', 'tests'), suffix: '.mjs' }
];

const testFiles = testDirectories
	.flatMap(({ path, suffix }) => readdirSync(path)
		.filter(name => name.endsWith(suffix))
		.map(name => join(path, name)))
	.sort((left, right) => left.localeCompare(right));

const failures = [];
for (const testFile of testFiles) {
	const label = relative(projectRoot, testFile);
	console.log(`===== ${label} =====`);
	const result = spawnSync(process.execPath, [testFile], {
		cwd: projectRoot,
		stdio: 'inherit',
		env: process.env
	});
	if (result.status !== 0) {
		failures.push({ label, status: result.status, signal: result.signal });
	}
}

if (failures.length > 0) {
	console.error('\nRPG TEST FAILURES');
	for (const failure of failures) {
		console.error(`- ${failure.label}: ${failure.signal || `exit ${failure.status}`}`);
	}
	process.exitCode = 1;
} else {
	console.log(`\nBH_RPG_SUITE_PASS ${testFiles.length} tests`);
}
