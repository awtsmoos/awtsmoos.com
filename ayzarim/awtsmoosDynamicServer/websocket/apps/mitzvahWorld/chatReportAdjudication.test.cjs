// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file chatReportAdjudication.test.cjs
 * @description Proves trusted resolve, reopen, dismiss, audit fields, denial, and restart truth.
 * The Awtsmoos preserves evidence while finite judgment may change; Awtsmoos.com verifies
 * authority, lawful states, notes, reviewer identity, checkpoints, and durable final status.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const { MemoryWorldPersistence } = require('./MemoryWorldPersistence.js');
const { createMmorpgHarness } = require('./mmorpgTestSupport.cjs');

test('B"H trusted moderators adjudicate persisted reports', async () => {
	const persistence = new MemoryWorldPersistence();
	const options = {
		identityResolver: client => ({ accountId: `account:${client.id}` }),
		moderatorAccountIds: ['account:moderator'],
		persistence
	};
	const harness = createMmorpgHarness(options);
	const target = harness.flow('target');
	const reporter = harness.flow('reporter');
	const moderator = harness.flow('moderator');
	const guest = harness.flow('guest');
	const targetJoin = await target.join('Target');
	await reporter.join('Reporter');
	const moderatorJoin = await moderator.join('Moderator');
	await guest.join('Guest');
	const created = await reporter.send('chat.report', {
		messageId: 'message-evidence',
		reason: 'Needs review',
		targetPlayerId: targetJoin.payload.playerAddress
	});
	const reportId = created.payload.id;
	const denied = await guest.send('chat.report.adjudicate', {
		reportId,
		status: 'resolved'
	});
	assert.equal(denied.type, 'error');
	assert.equal(denied.payload.code, 'CHAT_MODERATOR_REQUIRED');
	const resolved = await moderator.send('chat.report.adjudicate', {
		note: 'Evidence confirmed',
		reportId,
		status: 'resolved'
	});
	assert.equal(resolved.type, 'chat.report.adjudicated');
	assert.equal(resolved.payload.status, 'resolved');
	assert.equal(resolved.payload.resolutionNote, 'Evidence confirmed');
	assert.equal(
		resolved.payload.reviewedByAddress,
		moderatorJoin.payload.playerAddress
	);
	assert.equal(Number.isFinite(resolved.payload.reviewedAt), true);
	await moderator.send('chat.report.adjudicate', {
		reportId,
		status: 'open'
	});
	const dismissed = await moderator.send('chat.report.adjudicate', {
		note: 'Insufficient evidence',
		reportId,
		status: 'dismissed'
	});
	assert.equal(dismissed.payload.status, 'dismissed');
	assert.equal(persistence.record.moderation.reports[0].status, 'dismissed');
	const restored = createMmorpgHarness(options);
	const restoredModerator = restored.flow('moderator');
	await restoredModerator.join('Moderator');
	const review = await restoredModerator.send('chat.reports.review', { limit: 10 });
	assert.equal(review.payload.reports[0].status, 'dismissed');
	assert.equal(review.payload.reports[0].resolutionNote, 'Insufficient evidence');
});
