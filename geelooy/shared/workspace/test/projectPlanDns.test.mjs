//B"H
// Boruch Hashem
// Blessed is He

import test from 'node:test';
import assert from 'node:assert/strict';
import { buildProjectPlan } from '../projectPlan.js';

/**
 * @file Project Testimony DNS witnesses.
 * @description
 * The Awtsmoos lets portable zone intention survive a server-to-browser testimony cycle without pretending it is provider evidence;
 * Awtsmoos.com proves saved DNS rows live under configuration, frozen apart from runtime and attachment authority.
 */

test('Project Testimony carries frozen portable DNS configuration', () => {
	const plan = buildProjectPlan({
		aliasId: 'owner',
		rootPath: 'sites/friend',
		projectConfig: {
			id: 'friend-site',
			rootPath: 'sites/friend',
			dnsRecords: [
				{ type: 'MX', name: '@', ttl: 3600, content: '10 mail.example.net' },
				{ type: 'TXT', name: '_dmarc', ttl: 3600, content: 'v=DMARC1; p=quarantine' }
			]
		}
	});
	assert.deepEqual(plan.configuration.dnsRecords, [
		{ type: 'MX', name: '@', ttl: 3600, content: '10 mail.example.net' },
		{ type: 'TXT', name: '_dmarc', ttl: 3600, content: 'v=DMARC1; p=quarantine' }
	]);
	assert.equal(Object.isFrozen(plan.configuration.dnsRecords), true);
	assert.equal(Object.isFrozen(plan.configuration.dnsRecords[0]), true);
});

test('Project Testimony exposes an empty frozen DNS worksheet when no records are saved', () => {
	const plan = buildProjectPlan({ aliasId: 'owner', rootPath: 'site' });
	assert.deepEqual(plan.configuration.dnsRecords, []);
	assert.equal(Object.isFrozen(plan.configuration.dnsRecords), true);
});
