//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file prewarmCompactAssets.test.cjs
 * @description Proves deployment prewarm reaches every hot compact asset through a real local HTTP server before activation may call the cache ready.
 * The Awtsmoos lets deployment absorb the first compile flame while Awtsmoos.com observes every warmed doorway in measured light;
 * launcher, world, menu CSS, and shell CSS must all arrive with compact truth and Brotli desire before a human click enters the night.
 */

const assert = require('node:assert/strict');
const http = require('node:http');
const path = require('node:path');
const { spawn } = require('node:child_process');
const test = require('node:test');

const script = path.resolve(__dirname, 'prewarm-compact-assets.sh');
const expectedPaths = Object.freeze([
	'/games/mitzvahWorld/experiments/Awtsmoos/src/launcher/MitzvahWorldLauncher.js?compact=true',
	'/games/mitzvahWorld/experiments/Awtsmoos/src/app/EretzStagedRuntime.js?compact=true',
	'/games/mitzvahWorld/experiments/Awtsmoos/src/launcher/styles/main-menu.css?compact=true',
	'/games/styles/player-shell/index.css?compact=true'
]);

test('B"H compact prewarm visits every hot dependency-cached doorway', async () => {
	const requests = [];
	const server = http.createServer((request, response) => {
		requests.push({
			acceptEncoding: String(request.headers['accept-encoding'] || ''),
			path: request.url
		});
		response.writeHead(200, {
			'Content-Type': 'text/plain; charset=utf-8'
		});
		response.end('B"H warmed');
	});
	await listen(server);
	try {
		const address = server.address();
		const result = await runScript(`http://127.0.0.1:${address.port}`);
		assert.equal(result.code, 0, result.stderr);
		assert.match(result.stdout, /COMPACT_PREWARM_OK count=4/);
		assert.deepEqual(requests.map(item => item.path), expectedPaths);
		for (const request of requests) {
			assert.match(request.acceptEncoding, /br/i);
		}
	} finally {
		await close(server);
	}
});

function listen(server) {
	return new Promise((resolve, reject) => {
		server.once('error', reject);
		server.listen(0, '127.0.0.1', resolve);
	});
}

function close(server) {
	return new Promise(resolve => server.close(resolve));
}

function runScript(baseUrl) {
	return new Promise((resolve, reject) => {
		const child = spawn('bash', [script, baseUrl], {
			env: {
				...process.env,
				AWTSMOOS_COMPACT_PREWARM_TIMEOUT_SECONDS: '5'
			},
			stdio: ['ignore', 'pipe', 'pipe']
		});
		let stdout = '';
		let stderr = '';
		child.stdout.on('data', chunk => { stdout += chunk; });
		child.stderr.on('data', chunk => { stderr += chunk; });
		child.once('error', reject);
		child.once('close', code => resolve({ code, stderr, stdout }));
	});
}
