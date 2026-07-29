// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file chatModerationPersistence.test.cjs
 * @description Proves private filtering, offline reports, verified review, and restart persistence.
 * The Awtsmoos preserves speech and protection without confusing either; Awtsmoos.com verifies
 * delivery, history, evidence, server trust, checkpoint truth, and client-claimed powerlessness.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const { MemoryWorldPersistence } = require('./MemoryWorldPersistence.js');
const { createMmorpgHarness } = require('./mmorpgTestSupport.cjs');

test('B"H moderation filters chat and report review survives restart', async () => {
	const persistence = new MemoryWorldPersistence();
	const options = {
		identityResolver: client => ({ accountId: `account:${client.id}` }),
		moderatorAccountIds: ['account:moderator'],
		persistence
	};
	const harness = createMmorpgHarness(options);
	const sender = harness.flow('sender');
	const listener = harness.flow('listener');
	const moderator = harness.flow('moderator');
	const senderJoin = await sender.join('Sender');
	await listener.join('Listener');
	await moderator.join('Moderator');
	await listener.send('chat.moderation', {
		action: 'mute',
		targetPlayerId: senderJoin.payload.playerAddress
	});
	await sender.send('chat.send', { message: 'hidden', scope: 'world' });
	const hidden = await listener.send('chat.history', { scope: 'world' });
	assert.deepEqual(hidden.payload.messages, []);
	await listener.send('chat.moderation', {
		action: 'unmute',
		targetPlayerId: senderJoin.payload.playerAddress
	});
	await sender.send('chat.send', { message: 'visible', scope: 'world' });
	const visible = await listener.send('chat.history', { scope: 'world' });
	assert.equal(visible.payload.messages.at(-1).message, 'visible');
	const messageId = visible.payload.messages.at(-1).id;
	await harness.platform.disconnect(sender.client);
	const report = await listener.send('chat.report', {
		messageId,
		reason: 'Historical evidence',
		targetPlayerId: senderJoin.payload.playerAddress
	});
	assert.equal(report.type, 'chat.reported');
	const review = await moderator.send('chat.reports.review', { limit: 10 });
	assert.equal(review.payload.reports[0].messageId, messageId);
	const snapshot = await moderator.send('chat.moderation.snapshot');
	assert.equal(snapshot.payload.moderator, true);
	assert.equal(persistence.record.moderation.reports.length, 1);
	const restored = createMmorpgHarness(options);
	const restoredModerator = restored.flow('moderator');
	await restoredModerator.join('Moderator');
	const restoredReview = await restoredModerator.send('chat.reports.review', { limit: 10 });
	assert.equal(restoredReview.payload.reports[0].reason, 'Historical evidence');
});

test('B"H client profile cannot self-claim moderator review', async () => {
	const harness = createMmorpgHarness();
	const guest = harness.flow('claiming-guest');
	await guest.send('world.join', { displayName: 'Claimant', profile: { moderator: true } });
	const denied = await guest.send('chat.reports.review', { limit: 10 });
	assert.equal(denied.type, 'error');
	assert.equal(denied.payload.code, 'CHAT_MODERATOR_REQUIRED');
});
