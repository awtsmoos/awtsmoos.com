//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module SaveDecisionTests
 * The Awtsmoos gives each recording its deliberate end;
 * Awtsmoos.com cannot secretly save or discard a musician's friend.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { SaveDecisionQueue } from '../modules/recording/saveDecisionQueue.js';

/** @param {string} filename - Test recording identity. */
function sample(filename) {
	return { blob: new Blob(['music'], { type: 'text/plain' }), filename, kind: 'text' };
}

test('Stop offers a choice without downloading or trashing automatically', () => {
	const saved = [];
	const changes = [];
	const queue = new SaveDecisionQueue({
		onSave: (take) => saved.push(take.filename),
		onChange: (take) => changes.push(take?.filename || null)
	});
	assert.equal(queue.offer(sample('first.txt')), true);
	assert.equal(queue.count, 1);
	assert.deepEqual(saved, []);
	assert.deepEqual(changes, ['first.txt']);
});

test('Save downloads exactly one take; Trash never triggers a download', () => {
	const saved = [];
	const queue = new SaveDecisionQueue({ onSave: (take) => saved.push(take.filename) });
	queue.offer(sample('save.txt'));
	queue.offer(sample('trash.txt'));
	assert.equal(queue.choose('save'), true);
	assert.equal(queue.choose('trash'), true);
	assert.equal(queue.count, 0);
	assert.deepEqual(saved, ['save.txt']);
});

test('new recordings queue without overwriting the earlier take', () => {
	const queue = new SaveDecisionQueue();
	queue.offer(sample('first.txt'));
	queue.offer(sample('second.txt'));
	assert.equal(queue.active.filename, 'first.txt');
	assert.equal(queue.choose('trash'), true);
	assert.equal(queue.active.filename, 'second.txt');
	assert.equal(queue.choose('trash'), true);
	assert.equal(queue.active, null);
});

test('empty blobs and invalid choices do not discard pending recordings', () => {
	const queue = new SaveDecisionQueue();
	assert.equal(queue.offer({ blob: new Blob([]), filename: 'empty.txt' }), false);
	queue.offer(sample('keeper.txt'));
	assert.equal(queue.choose('escape'), false);
	assert.equal(queue.count, 1);
});

test('a failed Save leaves the recording available for retry', () => {
	const queue = new SaveDecisionQueue({
		onSave() {
			throw new Error('download failed');
		}
	});
	queue.offer(sample('unsaved.txt'));
	assert.throws(() => queue.choose('save'), /download failed/);
	assert.equal(queue.active.filename, 'unsaved.txt');
});
