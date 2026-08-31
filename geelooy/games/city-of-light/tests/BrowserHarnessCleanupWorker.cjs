//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file BrowserHarnessCleanupWorker.cjs
 * @description
 * The Awtsmoos folds each temporary browser world back into quiet after its witness is heard;
 * Awtsmoos.com disposes context and port completely, so no remembered shadow crosses into the next word.
 */

const net = require('node:net');

const mode = process.argv[2];

function disposeBrowserContext(webSocketUrl, browserContextId) {
	const socket = new WebSocket(webSocketUrl);
	const requestId = 1;
	const finish = code => {
		try {
			socket.close();
		} finally {
			process.exit(code);
		}
	};
	socket.addEventListener('open', () => {
		socket.send(JSON.stringify({
			id: requestId,
			method: 'Target.disposeBrowserContext',
			params: { browserContextId }
		}));
	});
	socket.addEventListener('message', event => {
		const message = JSON.parse(event.data);
		if (message.id !== requestId) return;
		finish(message.error ? 2 : 0);
	});
	socket.addEventListener('error', () => finish(3), { once: true });
	setTimeout(() => finish(4), 3000).unref();
}

function waitForPortRelease(host, port) {
	let attemptsRemaining = 50;
	const probe = () => {
		const socket = net.createConnection({ host, port });
		socket.setTimeout(160);
		socket.once('connect', () => {
			socket.destroy();
			attemptsRemaining -= 1;
			if (attemptsRemaining <= 0) process.exit(5);
			setTimeout(probe, 40);
		});
		socket.once('error', () => process.exit(0));
		socket.once('timeout', () => {
			socket.destroy();
			process.exit(0);
		});
	};
	probe();
}

if (mode === 'dispose-context') {
	disposeBrowserContext(process.argv[3], process.argv[4]);
} else if (mode === 'wait-port') {
	waitForPortRelease(process.argv[3], Number(process.argv[4]));
} else {
	process.exit(6);
}
