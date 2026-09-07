// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Boot = require("../lib/runtime/boot-resume-loop.js");
const LaunchRoot = require("../lib/runtime/launch-root.js");

/** Proves boot continuation preserves historical roots without widening current authority. */
async function main() {
	const rawAuthority = fs.mkdtempSync(path.join(os.tmpdir(), "awts-live-root-"));
	const rawHistorical = fs.mkdtempSync(path.join(os.tmpdir(), "awts-old-root-"));
	const authority = LaunchRoot.canonical(rawAuthority);
	const historical = LaunchRoot.canonical(rawHistorical);
	const missing = path.join(historical, "removed");
	const config = { root: rawAuthority, tunnelName: "boot-root-proof" };
	try {
		await proveCurrentAuthority(config, authority);
		const outside = Boot.usableBinding(config, {
			missionId: "mission-old", projectRoot: rawHistorical
		});
		assert.equal(outside.projectRoot, authority);
		assert.equal(outside.staleProjectRoot, rawHistorical);
		assert.equal(outside.fallbackReason, "persisted_project_root_outside_authority");
		const absent = Boot.usableBinding(config, {
			missionId: "mission-missing", projectRoot: missing
		});
		assert.equal(absent.projectRoot, authority);
		assert.equal(absent.staleProjectRoot, missing);
		assert.equal(absent.fallbackReason, "persisted_project_root_missing");
		assert.equal(Boot.start(() => {}, config, {
			env: { AWTSMOOS_REGISTRATION_MODE: "candidate-probe" },
			projectRoots: { read: () => { throw new Error("candidate_probe_read_registry"); } }
		}), null);
		console.log(JSON.stringify({ ok: true, authority, historical, outside, absent }));
	} finally {
		fs.rmSync(rawAuthority, { recursive: true, force: true });
		fs.rmSync(rawHistorical, { recursive: true, force: true });
	}
}

async function proveCurrentAuthority(config, authority) {
	let continuationRoot = "";
	let fsPayload = null;
	const binding = { missionId: "mission-current", projectRoot: config.root };
	const runner = Boot.start(() => {}, config, {
		env: { AWTSMOOS_MISSION_BOOT_RESUME: "1", AWTSMOOS_MISSION_BOOT_RESUME_MS: "60000" },
		startupDelayMs: 60000,
		projectRoots: { read: () => binding },
		autoContinuation: {
			run: async current => {
				continuationRoot = current.root;
				return { ok: true, scheduled: false, reason: "proof" };
			}
		},
		handleFs: async payload => {
			fsPayload = payload;
			return { ok: true, resumed: false };
		}
	});
	const result = await runner.tick("proof");
	clearInterval(runner.timer);
	assert.equal(result.ok, true);
	assert.equal(result.projectRoot, authority);
	assert.equal(continuationRoot, authority);
	assert.equal(fsPayload.projectRoot, authority);
	assert.equal(fsPayload.scopeRoot, authority);
	assert.equal(fsPayload.cwd, authority);
}

main().catch(error => {
	console.error(error?.stack || error);
	process.exitCode = 1;
});
