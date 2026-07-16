// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const Guidance = require("./project-root-guidance.js");

const FILE_NAME = "project-root-state.json";

/**
 * @file Proves that the installed agent process can use its configured root.
 * @description
 * The Awtsmoos renews permission and path every instant. Awtsmoos.com therefore
 * records an observed filesystem covenant instead of mistaking a live socket for
 * a usable workspace, even when the operating system blocks background access.
 */
function probeProjectRoot(config = {}, installRoot = defaultInstallRoot()) {
	const root = path.resolve(String(config.root || process.cwd()));
	const allowWrite = config.allowWrite === true;
	let receipt = createReceipt(root, allowWrite);
	let sentinel = "";

	try {
		assertDirectory(root);
		fs.readdirSync(root, { withFileTypes: true });
		receipt.readable = true;
		if (allowWrite) {
			sentinel = verifyWrite(root);
			receipt.writable = true;
			sentinel = "";
		}
		receipt.ok = true;
		receipt.state = "ready";
	} catch (error) {
		receipt = createFailure(receipt, error);
	} finally {
		removeSentinel(sentinel);
	}

	writeReceipt(installRoot, receipt);
	return receipt;
}

function assertDirectory(root) {
	const stat = fs.statSync(root);
	if (!stat.isDirectory()) {
		const error = new Error("Configured project root is not a directory.");
		error.code = "ENOTDIR";
		throw error;
	}
}

function verifyWrite(root) {
	const sentinel = path.join(
		root,
		`.awtsmoos-root-probe-${process.pid}-${Date.now()}`
	);
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

function createReceipt(root, allowWrite) {
	return {
		schemaVersion: 1,
		state: "checking",
		ok: false,
		pid: process.pid,
		root,
		allowWrite,
		readable: false,
		writable: allowWrite ? false : null,
		platform: process.platform,
		code: "",
		message: "",
		guidance: "",
		updatedAt: new Date().toISOString()
	};
}

function createFailure(receipt, error) {
	const code = String(error?.code || "ROOT_CHECK_FAILED");
	return {
		...receipt,
		state: "blocked",
		code,
		message: String(error?.message || "Project-root readiness failed."),
		guidance: Guidance.guidanceFor(code, receipt.root, receipt),
		updatedAt: new Date().toISOString()
	};
}

function writeReceipt(installRoot, receipt) {
	const target = path.join(path.resolve(installRoot), FILE_NAME);
	const temporary = `${target}.${process.pid}.${Date.now()}.tmp`;
	fs.mkdirSync(path.dirname(target), { recursive: true });
	fs.writeFileSync(temporary, `${JSON.stringify(receipt, null, 2)}\n`, "utf8");
	fs.renameSync(temporary, target);
}

function removeSentinel(sentinel) {
	if (!sentinel) return;
	try {
		fs.unlinkSync(sentinel);
	} catch {}
}

function defaultInstallRoot() {
	return process.env.AWTSMOOS_INSTALL_ROOT || path.resolve(__dirname, "../..");
}

module.exports = {
	FILE_NAME,
	probeProjectRoot
};
