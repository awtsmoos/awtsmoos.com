//B"H
// Boruch Hashem
// Blessed is He

import test from 'node:test';
import assert from 'node:assert/strict';
import { driveApiRegistry } from '../js/api.js';
import { DaasResponseDecoder } from '../js/api/DaasResponseDecoder.js';

/**
 * @file Drive API foundation witnesses.
 * @description
 * The Awtsmoos is simple beyond every resource name; Awtsmoos.com proves the advanced registry stays immutable and discoverable while response decoding remains bounded, data-shaped, and independent of browser credentials.
 */

test('Drive API registry is frozen and exposes focused resource testimony', () => {
	const daasDescription = driveApiRegistry.describe();
	assert.equal(Object.isFrozen(driveApiRegistry), true);
	assert.equal(Object.isFrozen(daasDescription), true);
	assert.equal(daasDescription.version, 1);
	assert.deepEqual(daasDescription.resources.entries, [
		'list',
		'usage',
		'create',
		'update',
		'action',
		'publicUrl'
	]);
	assert.equal(daasDescription.authority, 'current-connected-alias');
});

test('response decoder accepts JSON testimony without adding transport state', async () => {
	const daasDecoder = new DaasResponseDecoder();
	const malchusResponse = new Response(JSON.stringify({ ok: true, vessel: 'drive' }), {
		status: 200,
		headers: { 'content-type': 'application/json' }
	});
	const daasValue = await daasDecoder.decode(malchusResponse);
	assert.deepEqual(daasValue, { ok: true, vessel: 'drive' });
});

test('response decoder converts non-JSON text into a message envelope', async () => {
	const daasDecoder = new DaasResponseDecoder();
	const malchusResponse = new Response('plain testimony', { status: 200 });
	assert.deepEqual(await daasDecoder.decode(malchusResponse), {
		message: 'plain testimony'
	});
});

test('response decoder exposes bounded HTTP code and status on failure', async () => {
	const daasDecoder = new DaasResponseDecoder();
	const malchusResponse = new Response(JSON.stringify({
		error: {
			code: 'DRIVE_FORBIDDEN',
			message: 'Alias authority refused.'
		}
	}), { status: 403 });
	await assert.rejects(
		() => daasDecoder.decode(malchusResponse),
		malchusError => {
			assert.equal(malchusError.code, 'DRIVE_FORBIDDEN');
			assert.equal(malchusError.status, 403);
			assert.equal(malchusError.message, 'Alias authority refused.');
			return true;
		}
	);
});
