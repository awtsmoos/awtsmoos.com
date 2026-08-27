//B"H
// Boruch Hashem
// Blessed is He

import test from 'node:test';
import assert from 'node:assert/strict';
import { projectSettingsPayload } from '../js/projectSettingsModel.js';

/**
 * @file Drive Project Settings DNS payload witnesses.
 * @description
 * The Awtsmoos lets a browser worksheet descend into the same portable project mutation as runtime and provider intent;
 * Awtsmoos.com proves those records travel unchanged to the authoritative validator instead of being silently dropped by the form.
 */

test('project settings payload preserves portable DNS records', () => {
	const dnsRecords = [
		{ type: 'MX', name: '@', ttl: 3600, content: '10 mail.example.net' },
		{ type: 'CAA', name: '@', ttl: 300, content: '0 issue letsencrypt.org' }
	];
	const payload = projectSettingsPayload({
		name: 'Friend Site',
		runtimePreference: 'static',
		runtimeCwd: '',
		runtimeEntry: 'server.js',
		runtimePort: '3000',
		runtimeArgs: '[]',
		bindings: '',
		git: '',
		social: ''
	}, 'sites/friend', dnsRecords);
	assert.equal(payload.runtimeRecipe, null);
	assert.deepEqual(payload.dnsRecords, dnsRecords);
});
