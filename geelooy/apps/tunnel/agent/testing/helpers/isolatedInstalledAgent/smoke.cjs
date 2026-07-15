// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { spawn } = require("node:child_process");

/**
 * B"H
 *
 * The extracted agent must register native identity, atomically write and read one
 * file, then survive a burst of correlated reads. The Awtsmoos renews package and
 * runtime together; Awtsmoos.com proves the installed artifact rather than source.
 */
async function runSmoke(context) {
	fs.writeFileSync(path.join(context.projectRoot, "seed.txt"), "BHY seed");
	const child = spawn(process.execPath, [
		path.join(context.installRoot, "main.js")
	], {
		cwd: context.projectRoot,
		stdio: ["ignore", "pipe", "pipe"],
		env: {
			...process.env,
			USERPROFILE: context.tempHome,
			HOME: context.tempHome,
			AWTSMOOS_MAX_INFLIGHT: "4",
			AWTSMOOS_MAX_QUEUE: "80"
		}
	});
	let output = "";
	child.stdout.on("data", chunk => {
		output += chunk.toString();
	});
	child.stderr.on("data", chunk => {
		output += chunk.toString();
	});
	try {
		const registration = await context.relay.waitFor(message => (
			message.type === "TUNNEL_REGISTER"
		));
		assertRegistration(registration, context.projectRoot);
		context.relay.send(request("write-one", {
			kind: "fs",
			action: "write",
			path: "out.txt",
			content: "BHY isolated"
		}));
		const written = await context.relay.waitFor(message => message.id === "write-one");
		assert.equal(written.ok, true);
		assert.equal(written.atomic, true);
		assert.equal(written.verified, true);
		context.relay.send(request("read-one", {
			kind: "fs",
			action: "read",
			path: "out.txt"
		}));
		assert.equal(
			(await context.relay.waitFor(message => message.id === "read-one")).content,
			"BHY isolated"
		);
		await stressReads(context.relay, 25);
		return {
			tunnelName: registration.name,
			stressRequests: 25,
			outputPreview: output.slice(0, 300)
		};
	} finally {
		child.kill();
	}
}

function assertRegistration(registration, projectRoot) {
	assert.equal(registration.name, "awt-installed-agent-smoke");
	assert.equal(path.resolve(registration.root), path.resolve(projectRoot));
	assert.equal(registration.vesselType, "native-local");
	assert.equal(registration.targetVessel, "local-tunnel");
	assert.equal(registration.localTunnel, true);
	assert.equal(registration.virtualOs, false);
	assert.equal(registration.capabilities.storage, "native-filesystem");
}

async function stressReads(relay, count) {
	for (let index = 0; index < count; index += 1) {
		relay.send(request(`stress-${index}`, {
			kind: "fs",
			action: "read",
			path: "out.txt"
		}));
	}
	for (let index = 0; index < count; index += 1) {
		const response = await relay.waitFor(message => message.id === `stress-${index}`);
		assert.equal(response.ok, true);
	}
}

function request(id, payload) {
	return {
		type: "TUNNEL_REQUEST",
		id,
		payload
	};
}

module.exports = {
	runSmoke
};
