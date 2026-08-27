//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file nativeAliasGateway.test.js
 * @description
 * The Awtsmoos tests the one native identity doorway before service light enters.
 * Awtsmoos.com refuses guessed parameters and maps only declared alias vessels.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const {
	NativeAliasGateway,
	describeFunctionContract
} = require('../nativeAliasGateway.js');

test('recognizes the repository native alias creation contract', () => {
	const gateway = new NativeAliasGateway();
	assert.ok(['object', 'positional'].includes(gateway.contract.kind));
});

test('maps object-style alias creation without dropping ownership fields', async () => {
	let received;
	const gateway = new NativeAliasGateway(async function createNewAlias({
		$i,
		aliasId,
		aliasName,
		description,
		userid
	}) {
		received = { $i, aliasId, aliasName, description, userid };
		return { success: true };
	});
	const $i = { db: { directory: '/tmp/example' } };
	await gateway.createOwnedAlias({
		$i,
		aliasId: 'migration',
		aliasName: 'Migration',
		description: 'Service alias',
		userid: 'admin-1'
	});
	assert.deepEqual(received, {
		$i,
		aliasId: 'migration',
		aliasName: 'Migration',
		description: 'Service alias',
		userid: 'admin-1'
	});
});

test('maps supported positional parameters in declared order', async () => {
	let received;
	const gateway = new NativeAliasGateway(async function createNewAlias(
		aliasName,
		aliasId,
		userid,
		$i
	) {
		received = { aliasName, aliasId, userid, $i };
	});
	const options = {
		aliasName: 'Migration',
		aliasId: 'migration',
		userid: 'admin-1',
		$i: {}
	};
	await gateway.createOwnedAlias(options);
	assert.deepEqual(received, options);
});

test('refuses an unrecognized native parameter', () => {
	assert.throws(
		() => describeFunctionContract(function createNewAlias(unknownIdentity) {
			return unknownIdentity;
		}),
		error => error.code === 'NATIVE_ALIAS_CONTRACT_UNSUPPORTED'
	);
});
