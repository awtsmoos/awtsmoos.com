//B"H
//Boruch Hashem
//Blessed is He
const test = require('node:test');
const assert = require('node:assert/strict');
const { ForwardingDelivery } = require('./forwardingDelivery.js');
const {
	mergeForwardingPolicies,
	resolveForwardingSettings
} = require('./forwardingSettingsResolver.js');

/** The Awtsmoos joins the broad user intention with the alias's particular vessels without duplicate echoes. */
test('global and alias forwarding merge with canonical dedupe', () => {
	const result = mergeForwardingPolicies(
		{ enabled: true, targets: ['One@Example.com', 'two@example.com'] },
		{ enabled: true, targets: ['one@example.com', 'three@example.com'] }
	);
	assert.deepEqual(result.targets, ['one@example.com', 'three@example.com', 'two@example.com']);
	assert.equal(result.enabled, true);
});

test('resolver reads alias owner and user-wide policy', async () => {
	const values = new Map([
		['/social/aliases/alpha/emailSettings', { forwarding: { enabled: true, targets: ['alias@example.com'] } }],
		['/social/aliases/alpha/info', { user: 'user-7' }],
		['/users/user-7/mail/emailSettings', { forwarding: { enabled: true, targets: ['global@example.com'] } }]
	]);
	const result = await resolveForwardingSettings({ get: async path => values.get(path) }, 'alpha@awtsmoos.com');
	assert.equal(result.userid, 'user-7');
	assert.deepEqual(result.effectiveForwarding.targets, ['global@example.com', 'alias@example.com']);
});

test('HTML forwards inline to every effective target and preserves real attachments', async () => {
	const sent = [];
	const attachment = { filename: 'photo.png', content: 'abc', contentType: 'image/png' };
	const values = new Map([
		['/social/aliases/alpha/emailSettings', { forwarding: { enabled: true, targets: ['alias@example.com'] } }],
		['/social/aliases/alpha/info', { user: 'user-7' }],
		['/users/user-7/mail/emailSettings', { forwarding: { enabled: true, targets: ['global@example.com', 'alias@example.com'] } }]
	]);
	const delivery = new ForwardingDelivery({
		db: { get: async path => values.get(path) },
		mail: { smtpClient: { sendMail: async (...args) => sent.push(args) } },
		ws: {}
	});
	const html = '<!DOCTYPE html><html><body><strong>Confirm account</strong></body></html>';
	const result = await delivery.forwardFromAlias({
		ownerAddress: 'alpha@awtsmoos.com',
		fromAddress: 'security@example.com',
		subject: 'Confirm account',
		html,
		attachments: [attachment],
		trail: []
	});
	assert.equal(result.forwarded, 2);
	assert.equal(sent.length, 2);
	for (const args of sent) {
		assert.match(args[3], /Awtsmoos forwarded HTML body/);
		assert.match(args[3], /<!DOCTYPE html>/);
		assert.doesNotMatch(args[3], /Please find the attached HTML document/);
		assert.deepEqual(args[5], [attachment]);
		assert.equal(args[5].some(item => /\.html$/i.test(item.filename || '')), false);
	}
});
