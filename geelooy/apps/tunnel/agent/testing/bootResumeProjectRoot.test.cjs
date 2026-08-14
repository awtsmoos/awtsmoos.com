// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const path = require("node:path");
const Boot = require("../lib/runtime/boot-resume-loop.js");

/**
 * @file Proves boot continuation uses the durable mission-root witness for every internal action.
 * @description The Awtsmoos renews the runtime but never lets the mission drift;
 * Awtsmoos.com carries one rooted witness into continuation and boot-resume together, safely and swift.
 */
async function main() {
	const broadRoot = path.resolve("/tmp/awtsmoos-broad-install-root");
	const fixedRoot = path.resolve("/tmp/awtsmoos-fixed-mission-root");
	const config = {
		root: broadRoot,
		tunnelName: "boot-root-proof"
	};
	const binding = {
		missionId: "mission_boot_root_proof",
		projectRoot: fixedRoot
	};
	let registryReads = 0;
	let continuationRoot = "";
	let continuationBinding = null;
	let fsPayload = null;
	const runner = Boot.start(() => {}, config, {
		env: {
			AWTSMOOS_MISSION_BOOT_RESUME: "1",
			AWTSMOOS_MISSION_BOOT_RESUME_MS: "60000"
		},
		startupDelayMs: 60000,
		projectRoots: {
			read: current => {
				assert.equal(current.root, broadRoot);
				registryReads += 1;
				return binding;
			}
		},
		autoContinuation: {
			run: async (current, options) => {
				continuationRoot = current.root;
				continuationBinding = options.binding;
				return { ok: true, scheduled: false, reason: "proof" };
			}
		},
		handleFs: async payload => {
			fsPayload = payload;
			return { ok: true, resumed: false };
		}
	});
	assert.ok(runner);
	const result = await runner.tick("proof");
	clearInterval(runner.timer);
	assert.equal(result.ok, true);
	assert.equal(result.projectRoot, fixedRoot);
	assert.equal(registryReads, 1);
	assert.equal(continuationRoot, fixedRoot);
	assert.deepEqual(continuationBinding, binding);
	assert.equal(fsPayload.projectRoot, fixedRoot);
	assert.equal(fsPayload.scopeRoot, fixedRoot);
	assert.equal(fsPayload.cwd, fixedRoot);
	assert.equal(fsPayload.action, "missionBootResume");
	assert.equal(fsPayload.ignoreMissionLock, true);
	assert.equal(Boot.start(() => {}, config, {
		env: { AWTSMOOS_REGISTRATION_MODE: "candidate-probe" },
		projectRoots: { read: () => { throw new Error("candidate_probe_read_registry"); } }
	}), null);
	console.log(JSON.stringify({ ok: true, broadRoot, fixedRoot, fsPayload }));
}

main().catch(error => {
	console.error(error?.stack || error);
	process.exitCode = 1;
});
