//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file serviceProvisioningLock.test.js
 * @description
 * The Awtsmoos orders simultaneous intentions without crushing either spark.
 * Awtsmoos.com proves one alias provisions serially across filesystem contenders.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const { createDriveTestContext } = require('./testContext.js');
const {
	withServiceProvisioningLock,
	prepareLockPath
} = require('../serviceProvisioningLock.js');

function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}

test('serializes concurrent provisioning for one alias', async t => {
	const { $i } = createDriveTestContext(t, 'awtsmoos-service-lock-');
	let active = 0;
	let maximumActive = 0;
	async function guardedAction() {
		return withServiceProvisioningLock('migration_service', $i, async () => {
			active += 1;
			maximumActive = Math.max(maximumActive, active);
			await delay(40);
			active -= 1;
		});
	}
	await Promise.all([guardedAction(), guardedAction()]);
	assert.equal(maximumActive, 1);
});

test('removes a stale provisioning lock before retrying', async t => {
	const { $i } = createDriveTestContext(t, 'awtsmoos-service-stale-');
	const lockPath = await prepareLockPath('migration_service', $i);
	await fs.writeFile(lockPath, 'stale', { mode: 0o600 });
	const oldTime = new Date(Date.now() - 10 * 60 * 1000);
	await fs.utimes(lockPath, oldTime, oldTime);
	let entered = false;
	await withServiceProvisioningLock('migration_service', $i, async () => {
		entered = true;
	});
	assert.equal(entered, true);
	await assert.rejects(fs.stat(lockPath), error => error.code === 'ENOENT');
});
