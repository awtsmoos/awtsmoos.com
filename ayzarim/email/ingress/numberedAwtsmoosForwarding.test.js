//B"H
//Boruch Hashem
//Blessed is He
const test = require('node:test');
const assert = require('node:assert/strict');
const { IngressRecipientDelivery } = require('./recipientDelivery.js');
const {
	NUMBERED_AWTSMOOS_FORWARD_TARGET,
	isNumberedAwtsmoosAddress
} = require('../domain/numberedAwtsmoosForwarding.js');

/**
 * The Awtsmoos guards the numbered river by exact address shape, no phantom mailbox,
 * one external target, and a trail that prevents Awtsmoos.com from reflecting forever.
 */
test('numbered Awtsmoos matcher is exact', () => {
	assert.equal(isNumberedAwtsmoosAddress('awtsmoos1@awtsmoos.com'), true);
	assert.equal(isNumberedAwtsmoosAddress('AWTSMOOS5253773@AWTSMOOS.COM'), true);
	assert.equal(isNumberedAwtsmoosAddress('awtsmoos@awtsmoos.com'), false);
	assert.equal(isNumberedAwtsmoosAddress('awtsmoosabc@awtsmoos.com'), false);
	assert.equal(isNumberedAwtsmoosAddress('helloawtsmoos1@awtsmoos.com'), false);
	assert.equal(isNumberedAwtsmoosAddress('awtsmoos1@example.com'), false);
});

test('numbered recipient forwards externally without local storage', async () => {
	const sent = [];
	const forbiddenDb = async () => { throw new Error('LOCAL_DB_SHOULD_NOT_BE_USED'); };
	const context = {
		db: { get: forbiddenDb, appendToObj: forbiddenDb },
		mail: { smtpClient: { sendMail: async (...args) => sent.push(args) } },
		ws: {}
	};
	const delivery = new IngressRecipientDelivery(context);
	const result = await delivery.deliver({
		senderAddress: 'sender@example.com',
		subject: 'Catch-all test',
		text: 'hello',
		attachments: [],
		forwardingTrail: []
	}, 'awtsmoos5253773@awtsmoos.com');
	assert.equal(result.delivered, true);
	assert.equal(result.status, 'forwarded-catch-all');
	assert.equal(result.target, NUMBERED_AWTSMOOS_FORWARD_TARGET);
	assert.equal(sent.length, 1);
	const [from, target, subject, body, headers] = sent[0];
	assert.equal(from, 'awtsmoos5253773@awtsmoos.com');
	assert.equal(target, 'yeetzchawk@gmail.com');
	assert.equal(subject, 'Catch-all test');
	assert.equal(body, 'hello');
	assert.equal(headers['Reply-To'], 'sender@example.com');
	assert.equal(headers['X-Awtsmoos-Forwarded-By'], from);
	assert.match(headers['X-Awtsmoos-Forwarding-Trail'], /awtsmoos5253773@awtsmoos\.com/);
});

test('existing target in trail blocks a forwarding loop', async () => {
	let sends = 0;
	const delivery = new IngressRecipientDelivery({
		db: {},
		mail: { smtpClient: { sendMail: async () => { sends += 1; } } },
		ws: {}
	});
	const result = await delivery.deliver({
		senderAddress: 'sender@example.com',
		text: 'hello',
		forwardingTrail: ['yeetzchawk@gmail.com']
	}, 'awtsmoos9@awtsmoos.com');
	assert.equal(result.delivered, false);
	assert.equal(result.reason, 'FORWARDING_LOOP_BLOCKED');
	assert.equal(sends, 0);
});
