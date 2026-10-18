// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

/**
 * @file DriveIdentityTerminalContract.test.mjs
 * @description Locks release freshness and the law that every identity path exits loading.
 */

const identitySource = await readFile(
	new URL('../js/driveIdentity.js', import.meta.url),
	'utf8'
);
const registrySource = await readFile(
	new URL('../js/orchestration/HodDriveViewRegistry.js', import.meta.url),
	'utf8'
);
const applicationSource = await readFile(
	new URL('../js/orchestration/MalchusDriveApplication.js', import.meta.url),
	'utf8'
);
const appSource = await readFile(new URL('../js/app.js', import.meta.url), 'utf8');

const noAliasStart = identitySource.indexOf('if (!identity?.alias)');
const noAliasReturn = identitySource.indexOf('return identity;', noAliasStart);
const terminalCall = identitySource.indexOf('identityRequired();', noAliasStart);
assert.ok(noAliasStart >= 0, 'Drive identity must preserve the no-alias branch.');
assert.ok(terminalCall > noAliasStart, 'No-alias state must invoke its terminal renderer.');
assert.ok(noAliasReturn > terminalCall, 'Drive may return only after the terminal state is rendered.');
assert.match(identitySource, /identityError\(reason\);/);
assert.match(registrySource, /renderIdentityRequired\(\)/);
assert.match(registrySource, /renderIdentityError\(reason\)/);
assert.match(applicationSource, /identityRequired: \(\) => this\.hodViews\.renderIdentityRequired\(\)/);
assert.match(applicationSource, /identityError: reason => this\.hodViews\.renderIdentityError\(reason\)/);
assert.match(appSource, /startBuildVersionGuard/);
assert.match(appSource, /scripts\/freshness\/BuildVersionGuard\.js/);

for (const [name, source] of Object.entries({
	identitySource,
	registrySource,
	applicationSource,
	appSource
})) {
	assert.ok(source.split(/\r?\n/).length <= 120, `${name} must remain within 120 lines`);
}

console.log('B"H DriveIdentityTerminalContract.test passed');
