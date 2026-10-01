// B"H
'use strict';

const assert = require('assert');
const fs = require('fs');
const http = require('http');
const os = require('os');
const path = require('path');
const { laneIds } = require('../recovery/fabric/laneCatalog');
const { startFabric } = require('../recovery/fabric/fabricSupervisor');

const FABRIC = path.join(__dirname, '../recovery/fabric');
const ROOT = fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-lane-fabric-'));
const BASE_PORT = 20000 + (process.pid % 20000);

/**
 * @file emergencyLaneFabric.test.cjs
 * @description Twelve processes stand as twelve separate witnesses. Kill eleven
 * and the twelfth must still know its name, mission and breath without DosDB.
 */
function request(port, method, pathname, body = null) {
	return new Promise((resolve, reject) => {
		const bytes = body ? Buffer.from(JSON.stringify(body)) : null;
		const req = http.request({ host: '127.0.0.1', port, method, path: pathname, headers: bytes ? { 'content-type': 'application/json', 'content-length': bytes.length } : {} }, response => {
			const chunks = [];
			response.on('data', chunk => chunks.push(chunk));
			response.on('end', () => resolve({ status: response.statusCode, body: JSON.parse(Buffer.concat(chunks).toString('utf8')) }));
		});
		req.on('error', reject);
		if (bytes) req.write(bytes);
		req.end();
	});
}

async function waitHealth(port) {
	const deadline = Date.now() + 5000;
	while (Date.now() < deadline) {
		try {
			const result = await request(port, 'GET', '/health');
			if (result.status === 200) return result.body;
		} catch (_error) {}
		await new Promise(resolve => setTimeout(resolve, 50));
	}
	throw new Error(`lane_not_ready:${port}`);
}

function auditImports() {
	const forbidden = /(?:DosDB|taskRunner|awtsmoosDynamicServer|mail|publishing)/i;
	for (const name of fs.readdirSync(FABRIC).filter(name => name.endsWith('.js'))) {
		const source = fs.readFileSync(path.join(FABRIC, name), 'utf8');
		for (const match of source.matchAll(/require\((['"])(.*?)\1\)/g)) {
			assert(!forbidden.test(match[2]), `${name} imports forbidden dependency ${match[2]}`);
		}
	}
}

async function main() {
	auditImports();
	const ids = laneIds();
	assert.strictEqual(ids.length, 12);
	const mission = { missionId: 'fabric-test', summary: 'Keep rescue access alive.', canonicalRoute: 'test-route', nextActions: ['hold custody'] };
	const lanes = startFabric({ stateRoot: ROOT, basePort: BASE_PORT, mission });
	try {
		const health = await Promise.all(lanes.map(item => waitHealth(item.port)));
		assert.strictEqual(new Set(health.map(item => item.pid)).size, 12, 'lanes must be separate processes');
		for (const item of lanes) {
			const result = await request(item.port, 'GET', '/mission');
			assert.strictEqual(result.body.mission.missionId, 'fabric-test');
		}
		const target = lanes.find(item => item.laneId === 'handoff-custody');
		const accepted = await request(target.port, 'POST', '/handoff', { toLane: target.laneId, fromLane: 'direct-control', missionId: 'fabric-test', summary: 'Continue rescue.', nextActions: ['verify survivor'] });
		assert.strictEqual(accepted.status, 202);
		const latest = await request(target.port, 'GET', '/handoff/latest');
		assert.strictEqual(latest.body.handoff.custodyId, accepted.body.handoff.custodyId);
		const survivor = lanes[0];
		for (const item of lanes.slice(1)) item.child.kill('SIGTERM');
		await new Promise(resolve => setTimeout(resolve, 300));
		assert.strictEqual((await request(survivor.port, 'GET', '/health')).body.ok, true);
		assert.strictEqual((await request(survivor.port, 'GET', '/mission')).body.mission.missionId, 'fabric-test');
		console.log('B"H emergencyLaneFabric.test PASS: 12 independent processes, mission, handoff, kill isolation');
	} finally {
		for (const item of lanes) {
			try { item.child.kill('SIGKILL'); } catch (_error) {}
		}
		fs.rmSync(ROOT, { recursive: true, force: true });
	}
}

main().catch(error => { console.error(error); process.exitCode = 1; });
