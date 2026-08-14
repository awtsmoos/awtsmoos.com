// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const root = fs.mkdtempSync(path.join(os.tmpdir(), "command-mission-latency-"));
process.env.AWTSMOOS_INSTALL_ROOT = root;

const Command = require("../tools/command/index.js");
const Runtime = require("../tools/fs/actionRuntime.js");

/** Slow mission health cannot sit ahead of any public async command receipt. */
async function main() {
	const originalHealth = Runtime.healthyActive;
	const originals = new Map();
	const events = [];
	const releases = [];
	try {
		Runtime.healthyActive = () => new Promise(resolve => {
			events.push("mission");
			releases.push(() => resolve(null));
		});
		for (const action of ["commandStart", "commandRun", "shellCommand"]) {
			originals.set(action, Command.ACTIONS[action]);
			Command.ACTIONS[action] = async () => {
				events.push(`${action}:command`);
				return receipt(action);
			};
			const result = await within(Command.handleCommand({
				action,
				command: "echo fixture",
				mission: true,
				projectRoot: root
			}), 1000, action);
			assert.equal(result.jobId, `cmdjob_${action}`);
			assert.equal(result.missionAnnotationPending, true);
			assert.equal(result.agentGuidance.missionAnnotationPending, true);
		}
		assert.deepEqual(events, [
			"commandStart:command", "mission",
			"commandRun:command", "mission",
			"shellCommand:command", "mission"
		]);
		for (const release of releases) release();
		await Promise.resolve();
		console.log(JSON.stringify({
			ok: true,
			suite: "command-mission-acceptance-latency",
			actions: releases.length,
			missionContinued: true
		}, null, 2));
	} finally {
		Runtime.healthyActive = originalHealth;
		for (const [action, worker] of originals) Command.ACTIONS[action] = worker;
		fs.rmSync(root, { recursive: true, force: true });
	}
}

function receipt(action) {
	return {
		ok: true,
		action,
		jobId: `cmdjob_${action}`,
		status: "running",
		running: true
	};
}

function within(promise, milliseconds, action) {
	return Promise.race([
		promise,
		new Promise((_, reject) => setTimeout(
			() => reject(new Error(`${action}_acceptance_delayed`)),
			milliseconds
		))
	]);
}

main().catch(error => {
	console.error(error);
	process.exitCode = 1;
});
