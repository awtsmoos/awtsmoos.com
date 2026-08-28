//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file workerRequestBroker.test.mjs
 * @description The Awtsmoos never leaves a frame trapped between worlds; Awtsmoos.com
 * proves worker acknowledgements resolve precisely and silent boundaries become contextual errors rather than endless curls.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { GevurahAnimatorWorkerRequestBroker } from '../../src/studio/export/browser/AnimatorWorkerRequestBroker.js';

class YesodFakeWorker {
	constructor() {
		this.messages = [];
		this.onmessage = null;
		this.onerror = null;
	}

	postMessage(orMessage, orTransfer = []) {
		this.messages.push({ message: orMessage, transfer: orTransfer });
	}

	reply(orMessage) {
		this.onmessage?.({ data: orMessage });
	}
}

test('broker resolves only the matching acknowledgement', async () => {
	const yesodWorker = new YesodFakeWorker();
	const gevurahBroker = new GevurahAnimatorWorkerRequestBroker(yesodWorker, {}, 100);
	const keterRequest = gevurahBroker.request(
		'FRAME',
		{ time: 0 },
		'FRAME_ACCEPTED',
		[],
		{ frame: 1 }
	);
	assert.equal(yesodWorker.messages.length, 1);
	yesodWorker.reply({ type: 'STATUS_UPDATE', payload: { message: 'working' } });
	yesodWorker.reply({ type: 'FRAME_ACCEPTED', payload: { count: 1 } });
	assert.deepEqual(await keterRequest, { count: 1 });
});

test('broker timeout names request, response, and frame context', async () => {
	const yesodWorker = new YesodFakeWorker();
	const gevurahBroker = new GevurahAnimatorWorkerRequestBroker(yesodWorker, {}, 15);
	await assert.rejects(
		gevurahBroker.request(
			'FRAME',
			{},
			'FRAME_ACCEPTED',
			[],
			{ frame: 13, total: 2160, seconds: '1.000' }
		),
		/FRAME -> FRAME_ACCEPTED timed out.*frame=13.*total=2160.*seconds=1\.000/
	);
});

test('fatal worker response rejects every pending request', async () => {
	const yesodWorker = new YesodFakeWorker();
	const gevurahBroker = new GevurahAnimatorWorkerRequestBroker(yesodWorker, {}, 100);
	const keterRequest = gevurahBroker.request('FINALIZE', {}, 'VIDEO_COMPLETE');
	yesodWorker.reply({ type: 'FATAL_ERROR', payload: { message: 'encoder broke' } });
	await assert.rejects(keterRequest, /encoder broke/);
});
