// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Boot = require("../lib/runtime/boot-resume-loop.js");

/** Proves boot continuation uses a valid durable root and safely falls back. */
async function main() {
	const broadRoot = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-live-root-"));
	const fixedRoot = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-mission-root-"));
	const missingRoot = path.join(fixedRoot, "removed");
	const config = { root: broadRoot, tunnelName: "boot-root-proof" };
	const binding = { missionId: "mission_boot_root_proof", projectRoot: fixedRoot };
	let registryReads = 0;
	let continuationRoot = "";
	let continuationBinding = null;
	let fsPayload = null;
	try {
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

		const fallback = Boot.usableBinding(config, {
			missionId: binding.missionId,
			projectRoot: missingRoot
		});
		assert.equal(fallback.projectRoot, broadRoot);
		assert.equal(fallback.staleProjectRoot, missingRoot);
		assert.equal(fallback.fallbackReason, "persisted_project_root_missing");
		assert.equal(Boot.start(() => {}, config, {
			env: { AWTSMOOS_REGISTRATION_MODE: "candidate-probe" },
			projectRoots: { read: () => { throw new Error("candidate_probe_read_registry"); } }
		}), null);
		console.log(JSON.stringify({ ok: true, broadRoot, fixedRoot, fallback }));
	} finally {
		fs.rmSync(broadRoot, { recursive: true, force: true });
		fs.rmSync(fixedRoot, { recursive: true, force: true });
	}
}

main().catch(error => {
	console.error(error?.stack || error);
	process.exitCode = 1;
});
