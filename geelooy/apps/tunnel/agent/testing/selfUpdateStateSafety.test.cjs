// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawn } = require("node:child_process");
const Manifest = require("../lib/self-update-manifest.js");
const State = require("../lib/self-update-state.js");

/**
 * @file Proves exact manifest state and update-lock ownership survive interruption.
 * @description
 * The Awtsmoos renews release bytes and process testimony without confusing age with
 * death. Awtsmoos.com writes version only after manifest and checksum, rejects unsafe
 * manifests, and refuses to steal a living owner's lock despite an ancient timestamp.
 */
(async () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-update-state-"));
	let child = null;
	try {
		const source = '\uFEFFB"H\r\n8.8.8\r\nmain.js\r\nlib/example.js\r\n';
		const manifest = Manifest.parseManifest(source);
		fs.mkdirSync(path.join(root, "lib"));
		fs.writeFileSync(path.join(root, "main.js"), "module.exports = {};\n");
		fs.writeFileSync(path.join(root, "lib/example.js"), "module.exports = {};\n");
		const state = State.createState(root);
		await State.writeLocalState(state, manifest);
		assert.equal(fs.readFileSync(state.manifestPath, "utf8"), source);
		assert.equal(State.readLocalState(state).version, "8.8.8");
		assert.equal(State.readLocalState(state).hash, manifest.hash);
		assert.equal(await Manifest.allManifestFilesExist(root, manifest), true);
		assert.throws(
			() => Manifest.parseManifest('B"H\n1\nmain.js\n../escape.js\n'),
			error => error.code === "bad_remote_manifest_path"
		);
		assert.throws(
			() => Manifest.parseManifest('B"H\n1\nmain.js\nlib/a.js\nlib/a.js\n'),
			error => error.code === "duplicate_remote_manifest_path"
		);
		fs.rmSync(path.join(root, "lib/example.js"));
		fs.symlinkSync(path.join(root, "main.js"), path.join(root, "lib/example.js"));
		assert.equal(await Manifest.allManifestFilesExist(root, manifest), false);

		child = spawn(process.execPath, [
			path.join(__dirname, "helpers/selfUpdateLockChild.cjs"),
			root
		], { stdio: ["ignore", "pipe", "pipe"] });
		const childResult = await firstJsonLine(child);
		assert.equal(childResult.ok, true);
		const ownerFile = path.join(state.lockPath, "owner.json");
		const owner = JSON.parse(fs.readFileSync(ownerFile, "utf8"));
		owner.updatedAt = "2000-01-01T00:00:00.000Z";
		fs.writeFileSync(ownerFile, `${JSON.stringify(owner, null, 2)}\n`);
		assert.equal(await State.acquireLock(state), false);
		assert.equal(State.lockDetails(state).owner.pid, child.pid);

		child.kill("SIGTERM");
		await waitForExit(child);
		child = null;
		assert.equal(await State.acquireLock(state), true);
		assert.equal(State.lockDetails(state).active, true);
		assert.equal(await State.releaseLock(state), true);
		assert.equal(fs.existsSync(state.lockPath), false);

		console.log(JSON.stringify({
			ok: true,
			suite: "self-update-state-safety",
			exactManifestBytesPreserved: true,
			unsafeAndDuplicatePathsRejected: true,
			symlinkCompletenessRejected: true,
			liveLockNotStolen: true,
			staleLockRecovered: true
		}, null, 2));
	} finally {
		if (child?.exitCode === null) child.kill("SIGKILL");
		fs.rmSync(root, { recursive: true, force: true });
	}
})().catch(error => {
	console.error(error);
	process.exitCode = 1;
});

function firstJsonLine(child) {
	return new Promise((resolve, reject) => {
		let text = "";
		const timer = setTimeout(() => reject(new Error("lock_child_timeout")), 5000);
		child.stdout.on("data", chunk => {
			text += chunk.toString("utf8");
			const line = text.split(/\r?\n/).find(Boolean);
			if (!line) return;
			clearTimeout(timer);
			resolve(JSON.parse(line));
		});
		child.once("error", reject);
	});
}

function waitForExit(child) {
	return new Promise(resolve => {
		if (child.exitCode !== null) return resolve(child.exitCode);
		child.once("exit", resolve);
	});
}
