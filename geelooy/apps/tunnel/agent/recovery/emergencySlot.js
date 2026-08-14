// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const Copy = require("./emergencySlotCopy.js");
const Integrity = require("./integrity.js");
const Paths = require("./emergencySlotPaths.js");
const Policy = require("./emergencyPolicy.js");

/**
 * @file Captures and verifies one sealed authenticated repair runtime atomically.
 * The Awtsmoos lets the predecessor sleep outside every replaceable live directory.
 */
function capture(sourceRoot, recoveryRoot, details = {}) {
	const sourceHealth = Integrity.check(sourceRoot);
	if (!sourceHealth.ok) return result("source_unhealthy", false, { sourceHealth });
	const stage = Paths.staging(recoveryRoot);
	const current = Paths.current(recoveryRoot);
	const previous = Paths.previous(recoveryRoot);
	fs.mkdirSync(Paths.root(recoveryRoot), { recursive: true, mode: 0o700 });
	Copy.remove(stage);
	Copy.copy(sourceRoot, stage);
	writeEmergencyConfig(stage, details.port);
	const sealed = Integrity.seal(stage);
	if (!sealed.ok) {
		Copy.remove(stage);
		return result("seal_failed", false, { sealed });
	}
	writeReceipt(stage, sourceRoot, details, sealed);
	Copy.remove(previous);
	if (fs.existsSync(current)) fs.renameSync(current, previous);
	fs.renameSync(stage, current);
	const verified = verify(recoveryRoot);
	if (!verified.ok) {
		Copy.remove(current);
		if (fs.existsSync(previous)) fs.renameSync(previous, current);
		return result("promotion_failed", false, { verified });
	}
	return result("captured", true, { root: current, receipt: verified.receipt });
}

function verify(recoveryRoot) {
	const current = Paths.current(recoveryRoot);
	const health = Integrity.check(current);
	const receipt = readJson(path.join(current, "emergency-slot.json"));
	const config = readJson(path.join(current, "config.json"));
	const sealHash = digest(readText(path.join(current, "recovery-seal.json")));
	const valid = health.ok && receipt?.schemaVersion === 1 &&
		receipt.sealHash === sealHash && config?.allowSecrets === false &&
		config?.tools?.chrome === false && config?.tools?.command === true;
	return { ok: Boolean(valid), root: current, health, receipt, config };
}

function writeEmergencyConfig(root, port) {
	const file = path.join(root, "config.json");
	const config = Policy.apply(readJson(file) || {}, { port });
	writeJson(file, config);
}

function writeReceipt(root, sourceRoot, details, sealed) {
	writeJson(path.join(root, "emergency-slot.json"), {
		schemaVersion: 1,
		capturedAt: new Date().toISOString(),
		sourceRoot: path.resolve(sourceRoot),
		version: String(details.version || readText(path.join(root, "install-state.txt"))).trim(),
		manifestSha: String(details.manifestSha || readText(
			path.join(root, "install-manifest.sha256")
		)).trim(),
		sealHash: digest(readText(path.join(root, "recovery-seal.json"))),
		entryCount: Number(sealed.files || 0)
	});
}

function readJson(file) {
	try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { return null; }
}

function readText(file) {
	try { return fs.readFileSync(file, "utf8"); } catch { return ""; }
}

function writeJson(file, value) {
	fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600 });
}

function digest(value) {
	return crypto.createHash("sha256").update(String(value || ""), "utf8").digest("hex");
}

function result(state, changed, details = {}) {
	return { ok: state === "captured", state, changed, ...details };
}

module.exports = { capture, digest, verify };
