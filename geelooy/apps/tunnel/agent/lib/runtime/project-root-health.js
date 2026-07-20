// B"H
// Boruch Hashem
// Blessed is He
const fs = require("node:fs");
const path = require("node:path");
const Guidance = require("./project-root-guidance.js");
const FILE_NAME = "project-root-state.json";

/**
 * @file Proves that the exact installed process can use its configured root.
 * @description Receipts bind request, path, process, activation, version, and response.
 */
function probeProjectRoot(config = {}, installRoot = defaultInstallRoot()) {
	const root = path.resolve(String(config.root || process.cwd()));
	const allowWrite = config.allowWrite === true;
	let receipt = createReceipt(root, allowWrite, installRoot);
	let sentinel = "";
	try {
		assertDirectory(root);
		receipt.canonicalRoot = canonical(root);
		receipt.response.entriesObserved = fs.readdirSync(root, { withFileTypes: true }).length;
		receipt.readable = true;
		if (allowWrite) {
			sentinel = verifyWrite(root);
			receipt.writable = true;
			sentinel = "";
		}
		receipt.ok = true;
		receipt.state = "ready";
		receipt.response.ok = true;
	} catch (error) {
		receipt = createFailure(receipt, error);
	} finally {
		removeSentinel(sentinel);
	}
	receipt.updatedAt = new Date().toISOString();
	writeReceipt(installRoot, receipt);
	return receipt;
}

function assertDirectory(root) {
	if (fs.statSync(root).isDirectory()) return;
	const error = new Error("Configured project root is not a directory.");
	error.code = "ENOTDIR";
	throw error;
}

function verifyWrite(root) {
	const sentinel = path.join(root, `.awtsmoos-root-probe-${process.pid}-${Date.now()}`);
	const testimony = `B"H ${process.pid}\n`;
	fs.writeFileSync(sentinel, testimony, { flag: "wx", mode: 0o600 });
	if (fs.readFileSync(sentinel, "utf8") !== testimony) {
		const error = new Error("Project-root sentinel verification failed.");
		error.code = "EVERIFY";
		throw error;
	}
	fs.unlinkSync(sentinel);
	return "";
}

function createReceipt(root, allowWrite, installRoot) {
	return {
		schemaVersion: 2, state: "checking", ok: false, pid: process.pid,
		activationId: process.env.AWTSMOOS_ACTIVATION_ID || "",
		runtimeVersion: runtimeVersion(installRoot), root, canonicalRoot: "", allowWrite,
		readable: false, writable: allowWrite ? false : null, platform: process.platform,
		request: { action: "projectRootProbe", root, read: true, write: allowWrite },
		response: { ok: false, entriesObserved: null, code: "", message: "" },
		code: "", message: "", guidance: "", updatedAt: new Date().toISOString()
	};
}

function createFailure(receipt, error) {
	const code = String(error?.code || "ROOT_CHECK_FAILED");
	const message = String(error?.message || "Project-root readiness failed.");
	return {
		...receipt, state: "blocked", code, message,
		response: { ...receipt.response, code, message },
		guidance: Guidance.guidanceFor(code, receipt.root, receipt)
	};
}

function runtimeVersion(installRoot) {
	try { return fs.readFileSync(path.join(installRoot, "install-state.txt"), "utf8").trim(); }
	catch { return process.env.AWTSMOOS_RUNTIME_VERSION || "unknown"; }
}

function canonical(root) {
	return fs.realpathSync.native ? fs.realpathSync.native(root) : fs.realpathSync(root);
}

function writeReceipt(installRoot, receipt) {
	const target = path.join(path.resolve(installRoot), FILE_NAME);
	const temporary = `${target}.${process.pid}.${Date.now()}.tmp`;
	fs.mkdirSync(path.dirname(target), { recursive: true });
	fs.writeFileSync(temporary, `${JSON.stringify(receipt, null, 2)}\n`, { mode: 0o600 });
	fs.renameSync(temporary, target);
}

function removeSentinel(sentinel) {
	if (!sentinel) return;
	try { fs.unlinkSync(sentinel); } catch {}
}

function defaultInstallRoot() {
	return process.env.AWTSMOOS_INSTALL_ROOT || path.resolve(__dirname, "../..");
}

module.exports = { FILE_NAME, probeProjectRoot };
