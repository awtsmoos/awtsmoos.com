// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Controller = require("../recovery/controller.js");
const Integrity = require("../recovery/integrity.js");
const State = require("../recovery/stateStore.js");

/**
 * B"H
 * Temporary worlds fall and are recreated without touching production. The
 * Awtsmoos lets Awtsmoos.com preserve identity config while immutable source,
 * atomic memory, downgrade, sealing, and corruption detection remain strict.
 */
const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-recovery-"));

try {
	createRuntime(root);
	assert.equal(Integrity.check(root).ok, true);
	const sealed = Integrity.seal(root);
	assert.equal(sealed.files >= 6, true);
	assert.deepEqual(sealed.mutableIdentityFiles, ["config.json"]);
	assert.equal(Integrity.check(root).ok, true);

	fs.writeFileSync(path.join(root, "config.json"), "{\"identity\":\"preserved\"}\n");
	assert.equal(Integrity.check(root).ok, true);
	Controller.setTier(root, 5);
	for (let index = 0; index < 3; index += 1) {
		Controller.afterExit(root, 1000, 1);
	}
	assert.equal(State.read(root).tier, 4);
	assert.equal(State.read(root).consecutiveFailures, 0);
	Controller.afterExit(root, 31000, 0);
	assert.equal(State.read(root).consecutiveFailures, 0);

	fs.writeFileSync(path.join(root, "main.js"), "corrupted\n");
	const decision = Controller.beforeStart(root);
	assert.equal(decision.ok, false);
	assert.equal(decision.restoreRequired, true);
	assert.equal(decision.tier, 3);
	assert.ok(decision.failures.some(item => item === "seal:main.js"));

	const stateText = fs.readFileSync(path.join(root, "recovery-state.json"), "utf8");
	assert.doesNotThrow(() => JSON.parse(stateText));
	assert.ok(State.read(root).history.length >= 6);
	console.log(JSON.stringify({
		ok: true,
		suite: "recovery-controller",
		finalTier: State.read(root).tier,
		configPreservedAcrossSeal: true,
		restoreRequired: State.read(root).restoreRequired,
		history: State.read(root).history.length
	}, null, 2));
} finally {
	fs.rmSync(root, { recursive: true, force: true });
}

function createRuntime(target) {
	const files = [
		"main.js",
		"config.json",
		"tools/fs/commandJob/schedulerState.js",
		"tools/fs/commandJob/concurrencyProfile.js"
	];
	for (const relative of files) {
		const file = path.join(target, relative);
		fs.mkdirSync(path.dirname(file), { recursive: true });
		const content = relative.endsWith("concurrencyProfile.js")
			? "module.exports={resolve:()=>({tier:5})};\n"
			: "module.exports={};\n";
		fs.writeFileSync(file, content);
	}
	fs.writeFileSync(path.join(target, "install-state.txt"), "9.9.9\n");
	const manifest = ["9.9.9", "main.js", ...files.slice(1)].join("\n") + "\n";
	fs.writeFileSync(path.join(target, "installed-manifest.txt"), manifest);
	const hash = crypto.createHash("sha256").update(manifest).digest("hex");
	fs.writeFileSync(path.join(target, "install-manifest.sha256"), `${hash}  installed-manifest.txt\n`);
}
