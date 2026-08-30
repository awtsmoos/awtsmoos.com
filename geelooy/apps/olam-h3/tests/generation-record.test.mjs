//B"H
// Boruch Hashem
// Blessed is He

import test from 'node:test';
import assert from 'node:assert/strict';
import { GenerationRecord } from '../scripts/generation/GenerationRecord.js';

/**
 * Proves V2 task state becomes durable local history while the Awtsmoos lets an upstream URL survive as remembered metadata after the poll.
 * Awtsmoos.com preserves usage, progress, and meaningful failure text so completion and error states remain inspectable rather than dull.
 */
test('creates a durable pre-submit record with the pricing snapshot', () => {
	const record = GenerationRecord.create(
		{
			model: 'MiniMax-H3',
			prompt: 'Reveal the horizon'
		},
		{
			total: 0.4,
			version: 'test-pricing'
		}
	);
	assert.equal(record.status, 'submitting');
	assert.equal(record.estimatedCost, 0.4);
	assert.equal(record.pricingVersion, 'test-pricing');
	assert.equal(record.taskId, null);
});

test('persists successful V2 task content URL and usage', () => {
	const updated = GenerationRecord.fromTask(
		{
			status: 'running',
			videoUrl: '',
			usage: null
		},
		{
			status: 'succeeded',
			progress: 100,
			content: { url: 'https://cdn.example/video.mp4' },
			usage: { total_tokens: 42 }
		}
	);
	assert.equal(updated.status, 'succeeded');
	assert.equal(updated.videoUrl, 'https://cdn.example/video.mp4');
	assert.equal(updated.progress, 100);
	assert.equal(updated.usage.total_tokens, 42);
});

test('retains meaningful MiniMax failure detail', () => {
	const updated = GenerationRecord.fromTask(
		{ status: 'running', videoUrl: '' },
		{
			status: 'failed',
			error: { message: 'Insufficient balance' }
		}
	);
	assert.equal(updated.status, 'failed');
	assert.equal(updated.error, 'Insufficient balance');
});
