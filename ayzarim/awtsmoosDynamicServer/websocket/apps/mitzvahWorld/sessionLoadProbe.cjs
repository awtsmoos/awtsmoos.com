// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file sessionLoadProbe.cjs
 * @description Measures join, movement, reconnect, resync, and heartbeat pressure.
 * The Awtsmoos renews many players in one instant; this Awtsmoos.com probe counts
 * the bytes and latency created when authoritative snapshots cross many vessels.
 */

const { performance } = require('node:perf_hooks');
const { RealtimePlatform } = require('../../platform/RealtimePlatform.js');
const { createMitzvahWorldApplication } = require('./application.js');
const { WorldDirectory } = require('./WorldDirectory.js');
const {
	createClients,
	request,
	round,
	sum,
	summarize
} = require('./SessionLoadMetrics.cjs');

const CLIENT_COUNT = Number(process.env.MW_LOAD_CLIENTS || 50);

async function runProbe() {
	const directory = new WorldDirectory();
	const platform = new RealtimePlatform({}, [
		() => createMitzvahWorldApplication(directory)
	]);
	const latencies = [];
	const firstClients = createClients(CLIENT_COUNT, 'first');
	const heapBefore = process.memoryUsage().heapUsed;
	const started = performance.now();
	const joins = await Promise.all(firstClients.map((client, index) => request(
		platform,
		client,
		'world.join',
		{ displayName: `Load Player ${index}`, worldId: 'load-village' },
		`join-${index}`,
		1,
		latencies
	)));
	await Promise.all(firstClients.map((client, index) => request(
		platform,
		client,
		'player.input',
		{ facing: 0, forward: 1, strafe: 0 },
		`move-${index}`,
		2,
		latencies
	)));
	await Promise.all(firstClients.map(client => platform.disconnect(client)));
	const resumedClients = createClients(CLIENT_COUNT, 'resumed');
	await Promise.all(resumedClients.map((client, index) => request(
		platform,
		client,
		'world.join',
		{ resumeToken: joins[index].payload.session.resumeToken },
		`resume-${index}`,
		1,
		latencies
	)));
	await runRecoveryPhase(platform, directory, resumedClients, latencies);
	return createReport(
		directory,
		[...firstClients, ...resumedClients],
		latencies,
		heapBefore,
		performance.now() - started
	);
}

async function runRecoveryPhase(platform, directory, clients, latencies) {
	await Promise.all(clients.map((client, index) => request(
		platform,
		client,
		'world.resync',
		{ lastAcknowledgedRevision: 0 },
		`resync-${index}`,
		2,
		latencies
	)));
	const revision = directory.rooms.get('load-village').revision;
	await Promise.all(clients.map((client, index) => request(
		platform,
		client,
		'world.heartbeat',
		{ lastAcknowledgedRevision: revision },
		`heartbeat-${index}`,
		3,
		latencies
	)));
}

function createReport(directory, clients, latencies, heapBefore, elapsedMs) {
	const room = directory.rooms.get('load-village');
	return {
		bytesSent: sum(clients, client => client.bytesSent),
		clients: CLIENT_COUNT,
		elapsedMs: round(elapsedMs),
		heapDeltaBytes: process.memoryUsage().heapUsed - heapBefore,
		messagesSent: sum(clients, client => client.messagesSent),
		playerCount: room.players.size,
		requests: latencies.length,
		...summarize(latencies),
		worldRevision: room.revision
	};
}

runProbe().then(result => console.log(JSON.stringify(result, null, 2))).catch(error => {
	console.error(JSON.stringify({ error: error.message, stack: error.stack }, null, 2));
	process.exitCode = 1;
});
