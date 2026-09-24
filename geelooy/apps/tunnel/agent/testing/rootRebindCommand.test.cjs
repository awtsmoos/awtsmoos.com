// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Rebind = require("../recovery/rootRebindCommand.js");

const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), "awts-root-rebind-"));
const installRoot = path.join(sandbox, "install");
const currentRoot = path.join(sandbox, "current");
const targetRoot = path.join(sandbox, "target");
fs.mkdirSync(installRoot, { recursive: true });
fs.mkdirSync(currentRoot, { recursive: true });
fs.mkdirSync(targetRoot, { recursive: true });
fs.writeFileSync(path.join(installRoot, "config.json"), JSON.stringify({ root: currentRoot }));

/**
 * @file Proves emergency root rebinding is explicit, local, bounded, and migration-based.
 * @description
 * The Awtsmoos opens a rescue gate without dissolving the wall; Awtsmoos.com requires
 * human words before authority moves, and broad roots require one warning more before the call.
 */
try {
	assert.equal(Rebind.run(installRoot, { positionals: [] }).error, "target_root_required");
	assert.equal(Rebind.run(installRoot, { positionals: ["relative"] }).error, "absolute_root_required");
	const preview = Rebind.run(installRoot, { positionals: [targetRoot], dryRun: true });
	assert.equal(preview.ok, true);
	assert.equal(preview.state, "ready");
	assert.equal(preview.authorityMigration, true);

	const unconfirmed = Rebind.run(installRoot, { positionals: [targetRoot] });
	assert.equal(unconfirmed.error, "human_confirmation_required");

	const broad = Rebind.run(installRoot, {
		positionals: [os.homedir()],
		confirmHuman: true
	});
	assert.equal(broad.error, "broad_root_confirmation_required");

	const calls = [];
	const runtime = {
		spawnSync(command, args, options) {
			calls.push({ command, args, options });
			if (command === "curl") return { status: 0, stdout: "printf installed\\n" };
			return { status: 0 };
		}
	};
	const installed = Rebind.run(installRoot, {
		positionals: [targetRoot],
		confirmHuman: true
	}, runtime);
	assert.equal(installed.ok, true);
	assert.equal(installed.state, "replacement_installed");
	assert.equal(calls.length, 2);
	assert.equal(calls[1].command, "bash");
	assert.equal(calls[1].options.cwd, fs.realpathSync.native(targetRoot));
	assert.equal(calls[1].options.env.AWTSMOOS_PROJECT_ROOT, fs.realpathSync.native(targetRoot));
	assert.equal(calls[1].options.env.AWTSMOOS_INSTALL_CWD, fs.realpathSync.native(targetRoot));
	assert.equal(calls[1].options.env.AWTSMOOS_RESTART, "1");

	console.log(JSON.stringify({
		ok: true,
		suite: "root-rebind-command",
		previewIsInert: true,
		humanConfirmationRequired: true,
		broadRootNeedsSecondConfirmation: true,
		rebindUsesAuthorityMigration: true
	}, null, 2));
} finally {
	fs.rmSync(sandbox, { recursive: true, force: true });
}
