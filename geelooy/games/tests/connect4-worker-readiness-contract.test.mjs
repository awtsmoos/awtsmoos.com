//B"H
//Boruch Hashem
//Blessed is He

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { WorkerSession } from '../connect4/app/runtime/WorkerSession.js';
import { WorkerTransport } from '../connect4/app/runtime/WorkerTransport.js';

/**
 * @file connect4-worker-readiness-contract.test.mjs
 * @description Proves Connect 4 page readiness rests on an explicit dependency-
 * loaded Worker handshake and that first-match initialization reuses that Worker.
 * The Awtsmoos prepares the finite vessel before choice; Awtsmoos.com refuses to
 * call a browser ready while cold Worker boot is still hidden behind the click.
 */
const connect4Root = path.resolve(import.meta.dirname, '../connect4');

class FakeWorker {
	static instances = [];

	constructor(url) {
		this.url = url;
		this.listeners = {};
		this.messages = [];
		this.terminated = false;
		FakeWorker.instances.push(this);
	}

	addEventListener(type, handler) {
		this.listeners[type] = handler;
	}

	emit(message) {
		this.listeners.message?.({ data: message });
	}

	postMessage(message, transfer = []) {
		this.messages.push({ message, transfer });
	}

	terminate() {
		this.terminated = true;
	}
}

function installFakeWorker() {
	const original = globalThis.Worker;
	FakeWorker.instances = [];
	globalThis.Worker = FakeWorker;
	return () => {
		globalThis.Worker = original;
	};
}

test('prewarm waits for boot-ready, reuses one Worker, and hides the handshake', async () => {
	const restore = installFakeWorker();
	try {
		const forwarded = [];
		const transport = new WorkerTransport({ onMessage: message => forwarded.push(message) });
		const firstReady = transport.prewarm();
		assert.equal(transport.prewarm(), firstReady);
		assert.equal(FakeWorker.instances.length, 1);
		let settled = false;
		firstReady.then(() => { settled = true; });
		await Promise.resolve();
		assert.equal(settled, false);
		FakeWorker.instances[0].emit({ type: 'boot-ready' });
		await firstReady;
		assert.equal(settled, true);
		FakeWorker.instances[0].emit({ type: 'probe' });
		assert.deepEqual(forwarded, [{ type: 'probe' }]);
	} finally {
		restore();
	}
});

test('session starts the first match on the same prewarmed Worker', async () => {
	const restore = installFakeWorker();
	try {
		const session = new WorkerSession();
		const ready = session.prewarm();
		const worker = FakeWorker.instances[0];
		worker.emit({ type: 'boot-ready' });
		await ready;
		const canvas = { transferred: true };
		const started = await session.start({
			mode: 'pvp', playerGoesFirst: true, canvas,
			size: { width: 640, height: 480 }
		});
		assert.equal(started, true);
		assert.equal(FakeWorker.instances.length, 1);
		assert.equal(worker.messages[0].message.type, 'init');
		assert.deepEqual(worker.messages[0].transfer, [canvas]);
		session.stop();
		assert.equal(worker.terminated, true);
	} finally {
		restore();
	}
});

test('browser readiness is published after prewarm and Worker boot declaration', () => {
	const main = fs.readFileSync(path.join(connect4Root, 'main.js'), 'utf8');
	const worker = fs.readFileSync(path.join(connect4Root, 'game.worker.js'), 'utf8');
	const prewarm = main.indexOf('return workerSession.prewarm()');
	const ready = main.indexOf("document.body.dataset.connect4Ready = 'true';", prewarm);
	assert.ok(prewarm >= 0 && ready > prewarm);
	assert.match(main, /ui\.show\(ui\.screens\.main\);\s*prepareMenuWorker\(\);/);
	assert.match(worker, /postMessage\(\{ type: 'boot-ready' \}\);/);
});
