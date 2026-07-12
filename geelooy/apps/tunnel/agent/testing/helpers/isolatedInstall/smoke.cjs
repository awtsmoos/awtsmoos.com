// B"H
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const AgentProcess = require('./agentProcess.cjs');
const CommandSmoke = require('./commandSmoke.cjs');
const Paths = require('./paths.cjs');
const Requests = require('./requests.cjs');

/** B"H — Installed files, filesystem, and command receipts are proven in temp. */
function verifyInstall(installRoot) {
	const [version, entryFile, ...files] = Paths.manifestLines();
	assert.equal(entryFile, 'main.js');
	assert.equal(fs.existsSync(path.join(installRoot, entryFile)), true);
	for (const filePath of files) {
		assert.equal(fs.existsSync(path.join(installRoot, filePath)), true, filePath);
	}
	assert.equal(Paths.read(path.join(installRoot, 'install-state.txt')).trim(), version);
	const config = JSON.parse(Paths.read(path.join(installRoot, 'config.json')));
	assert.equal(config.tunnelName, 'awt-isolated-install-test');
	return { version, entryFile, fileCount: files.length, config };
}

async function smokeInstalled(options) {
	fs.writeFileSync(path.join(options.projectRoot, 'seed.txt'), 'BHY seed');
	const processRecord = AgentProcess.start(options);
	try {
		const registration = await AgentProcess.waitForRegistration(processRecord, options.relay);
		assertRegistration(registration, options.projectRoot);
		await proveFileRoundTrip(options.relay);
		await proveConcurrentReads(options.relay, 25);
		const commands = await CommandSmoke.run(options.relay);
		const output = processRecord.output();
		return {
			tunnelName: registration.name,
			stressRequests: 25,
			commands,
			stdoutTail: output.stdout.slice(-1000),
			stderrTail: output.stderr.slice(-1000)
		};
	} finally {
		await AgentProcess.stop(processRecord);
	}
}

function assertRegistration(registration, projectRoot) {
	assert.equal(registration.name, 'awt-isolated-install-test');
	assert.equal(path.resolve(registration.root), path.resolve(projectRoot));
	assert.equal(registration.vesselType, 'native-local');
	assert.equal(registration.targetVessel, 'local-tunnel');
	assert.equal(registration.localTunnel, true);
	assert.equal(registration.virtualOs, false);
	assert.equal(registration.capabilities.storage, 'native-filesystem');
}

async function proveFileRoundTrip(relay) {
	const written = await Requests.sendRequest(relay, 'write-round-trip', {
		kind: 'fs',
		action: 'write',
		path: 'out.txt',
		content: 'BHY isolated'
	});
	assert.equal(written.ok, true);
	const read = await Requests.sendRequest(relay, 'read-round-trip', {
		kind: 'fs',
		action: 'read',
		path: 'out.txt'
	});
	assert.equal(read.content, 'BHY isolated');
}

async function proveConcurrentReads(relay, count) {
	for (let index = 0; index < count; index += 1) {
		relay.send({
			type: 'TUNNEL_REQUEST',
			id: `stress-${index}`,
			payload: { kind: 'fs', action: 'read', path: 'out.txt' }
		});
	}
	for (let index = 0; index < count; index += 1) {
		const response = await Requests.terminalResponse(relay, `stress-${index}`, 15000);
		assert.equal(response.ok, true);
		assert.equal(response.content, 'BHY isolated');
	}
}

module.exports = { smokeInstalled, verifyInstall };
