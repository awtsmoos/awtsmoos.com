//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file compactPrewarm.test.cjs
 * @description Proves deploy prewarming visits the four hot packed vessels through the living local server before activation declares success.
 * The Awtsmoos lets deployment carry the cold compile flame before a player touches the gate;
 * Awtsmoos.com warms each named ohr with Brotli in the night, so the first human click may inherit already-open light.
 */

const assert = require('node:assert/strict');
const http = require('node:http');
const path = require('node:path');
const { readFile } = require('node:fs/promises');
const { spawn } = require('node:child_process');
const test = require('node:test');

const ROOT = path.resolve(__dirname, '../..');
const PREWARM = path.join(ROOT, 'scripts/production/prewarm-compact-assets.sh');
const ACTIVATE = path.join(ROOT, 'scripts/production/canonical-server-activate.sh');
const EXPECTED_PATHS = [
	'/games/mitzvahWorld/experiments/Awtsmoos/src/launcher/MitzvahWorldLauncher.js?compact=true',
	'/games/mitzvahWorld/experiments/Awtsmoos/src/app/EretzStagedRuntime.js?compact=true',
	'/games/mitzvahWorld/experiments/Awtsmoos/src/launcher/styles/main-menu.css?compact=true',
	'/games/styles/player-shell/index.css?compact=true'
];

function runPrewarm(baseUrl) {
	return new Promise((resolve, reject) => {
		const child = spawn('bash', [PREWARM, baseUrl], {
			cwd: ROOT,
			stdio: ['ignore', 'pipe', 'pipe']
		});
		let stdout = '';
		let stderr = '';
		child.stdout.on('data', chunk => { stdout += chunk; });
		child.stderr.on('data', chunk => { stderr += chunk; });
		child.on('error', reject);
		child.on('close', code => {
			if (code !== 0) {
				reject(new Error(`prewarm exited ${code}: ${stderr}`));
				return;
			}
			resolve(stdout);
		});
	});
}

test('prewarm visits every hot compact asset with Brotli negotiation', async () => {
	const requests = [];
	const server = http.createServer((request, response) => {
		requests.push({
			acceptEncoding: request.headers['accept-encoding'] || '',
			url: request.url
		});
		response.writeHead(200, { 'Content-Type': 'text/plain' });
		response.end('B\"H warm');
	});
	await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
	try {
		const address = server.address();
		const output = await runPrewarm(`http://127.0.0.1:${address.port}`);
		assert.deepEqual(requests.map(item => item.url), EXPECTED_PATHS);
		for (const request of requests) {
			assert.match(request.acceptEncoding, /br/);
		}
		assert.match(output, /COMPACT_PREWARM_OK count=4/);
	} finally {
		await new Promise(resolve => server.close(resolve));
	}
});

test('canonical activation prewarms after protocol proof and before success receipt', async () => {
	const source = await readFile(ACTIVATE, 'utf8');
	const protocolIndex = source.indexOf('virtual_ssh_protocol_probe_failed');
	const prewarmIndex = source.indexOf('compact_prewarm_failed');
	const successIndex = source.indexOf('CANONICAL_SERVER_ACTIVE');
	assert.ok(protocolIndex >= 0);
	assert.ok(prewarmIndex > protocolIndex);
	assert.ok(successIndex > prewarmIndex);
});
