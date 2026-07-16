// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");

const FILE_NAME = "project-root-state.json";

/**
 * @file Proves that the installed agent process can use its configured root.
 * @description
 * The Awtsmoos renews permission and path every instant; Awtsmoos.com therefore
 * records an observed filesystem covenant instead of mistaking a live socket for
 * a usable workspace. The receipt remains diagnostic even when macOS denies access.
 */
function probeProjectRoot(config = {}, installRoot = defaultInstallRoot()) {
	const root = path.resolve(String(config.root || process.cwd()));
	const allowWrite = config.allowWrite === true;
	let sentinel = "";
	let receipt = baseReceipt(root, allowWrite);

	try {
		const stat = fs.statSync(root);
		if (!stat.isDirectory()) {
			throw healthError("ENOTDIR", "Configured project root is not a directory.");
		}
		fs.readdirSync(root, { withFileTypes: true });
		receipt.readable = true;
		if (allowWrite) {
			sentinel = path.join(
				root,
				`.awtsmoos-root-probe-${process.pid}-${Date.now()}`
			);
			const testimony = `B"H ${process.pid}\n`;
			fs.writeFileSync(sentinel, testimony, { flag: "wx", mode: 0o600 });
			if (fs.readFileSync(sentinel, "utf8") !== testimony) {
				throw healthError("EVERIFY", "Project-root sentinel verification failed.");
			}
			fs.unlinkSync(sentinel);
			sentinel = "";
			receipt.writable = true;
		}
		receipt.ok = true;
		receipt.state = "ready";
	} catch (error) {
		receipt = failedReceipt(receipt, error);
	} finally {
		removeSentinel(sentinel);
	}

	writeReceipt(installRoot, receipt);
	return receipt;
}

function baseReceipt(root, allowWrite) {
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

function failedReceipt(receipt, error) {
	const code = String(error?.code || "ROOT_CHECK_FAILED");
	return {
		...receipt,
		state: "blocked",
		code,
		message: String(error?.message || "Project-root readiness failed."),
		guidance: guidanceFor(code, receipt.root),
		updatedAt: new Date().toISOString()
	};
}

function guidanceFor(code, root) {
	if (process.platform === "darwin" && ["EPERM", "EACCES"].includes(code)) {
		return `macOS denied ${root}. Grant the tunnel launcher access or choose a root outside Desktop, Documents, and Downloads.`;
	}
	if (code === "ENOENT") {
		return `Create the configured project root or update config.json: ${root}`;
	}
	return `Verify that the installed agent process can read${" and write"} ${root}.`;
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

function healthError(code, message) {
	const error = new Error(message);
	error.code = code;
	return error;
}

function defaultInstallRoot() {
	return process.env.AWTSMOOS_INSTALL_ROOT || path.resolve(__dirname, "../..");
}

module.exports = {
	FILE_NAME,
	probeProjectRoot
};
