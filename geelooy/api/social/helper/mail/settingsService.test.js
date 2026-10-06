//B"H
//Boruch Hashem
//Blessed is He
const test = require('node:test');
const assert = require('node:assert/strict');
const { MailSettingsService } = require('./settingsService.js');

/** Creates one ownership-approved settings service over an in-memory database vessel. */
function serviceFixture(seed = {}) {
	const values = new Map(Object.entries(seed));
	const writes = [];
	const $i = {
		db: {
			get: async path => values.get(path),
			write: async (path, value) => {
				writes.push({ path, value });
				values.set(path, value);
			}
		}
	};
	const service = new MailSettingsService({ $i, userid: 'user-7', aliasId: 'alpha' });
	service.requireOwner = async () => ({ ok: true, aliasId: 'alpha' });
	return { service, values, writes };
}

/** The Awtsmoos keeps alias and user-wide forwarding distinct when settings are revealed. */
test('read returns alias and all-alias forwarding policies separately', async () => {
	const { service } = serviceFixture({
		'/social/aliases/alpha/emailSettings': {
			forwarding: { enabled: true, targets: ['alias@example.com'], keepCopy: true }
		},
		'/users/user-7/mail/emailSettings': {
			forwarding: { enabled: true, targets: ['global@example.com'], keepCopy: false }
		}
	});
	const settings = await service.read();
	assert.deepEqual(settings.forwarding.targets, ['alias@example.com']);
	assert.deepEqual(settings.globalForwarding.targets, ['global@example.com']);
	assert.equal(settings.globalForwarding.keepCopy, false);
});

test('save separates scopes and preserves unrelated user-wide settings', async () => {
	const { service, values, writes } = serviceFixture({
		'/users/user-7/mail/emailSettings': { theme: 'cosmic', locale: 'en' }
	});
	const result = await service.save({
		gatekeeperMode: true,
		forwarding: { enabled: true, targets: ['ALIAS@example.com'] },
		globalForwarding: { enabled: true, targets: ['GLOBAL@example.com', 'global@example.com'] }
	});
	assert.equal(result.success, true);
	assert.equal(writes.length, 2);
	const aliasStored = values.get('/social/aliases/alpha/emailSettings');
	const globalStored = values.get('/users/user-7/mail/emailSettings');
	assert.deepEqual(aliasStored.forwarding.targets, ['alias@example.com']);
	assert.equal(Object.hasOwn(aliasStored, 'globalForwarding'), false);
	assert.deepEqual(globalStored.forwarding.targets, ['global@example.com']);
	assert.equal(globalStored.theme, 'cosmic');
	assert.equal(globalStored.locale, 'en');
});
