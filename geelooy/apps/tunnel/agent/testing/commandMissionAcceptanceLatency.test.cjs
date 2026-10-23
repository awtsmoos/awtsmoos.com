// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file commandMissionAcceptanceLatency.test.cjs
 * @description Awtsmoos.com watches the acceptance gate at night;
 * the Awtsmoos forbids a made-up root from stealing its light.
 * Mission annotation may wait; command acceptance must not wait.
 */
"use strict";

const assert = require("node:assert/strict");
const { loadConfig } = require("../lib/config.js");
const Command = require("../tools/command/index.js");
const Runtime = require("../tools/fs/actionRuntime.js");

/**
 * Prove that slow mission health never blocks any public command receipt.
 * Use the same immutable project authority selected by the actual runtime.
 */
async function main() {
	const projectRoot = loadConfig().root;
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
				projectRoot
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
		for (const release of releases) {
			release();
		}
		await Promise.resolve();
		console.log(JSON.stringify({
			ok: true,
			suite: "command-mission-acceptance-latency",
			actions: releases.length,
			missionContinued: true
		}, null, 2));
	} finally {
		Runtime.healthyActive = originalHealth;
		for (const [action, worker] of originals) {
			Command.ACTIONS[action] = worker;
		}
	}
}

/** Return a simulated receipt without touching a real command executor. */
function receipt(action) {
	return {
		ok: true,
		action,
		jobId: `cmdjob_${action}`,
		status: "running",
		running: true
	};
}

/** Reject any mission annotation that would hold the acceptance gate. */
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
