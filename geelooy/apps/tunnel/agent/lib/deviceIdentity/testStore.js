// B"H

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

/** Isolated test-only secret adapter; production never selects this module. */
function file(service, account) {
	const installRoot = path.resolve(String(process.env.AWTSMOOS_INSTALL_ROOT || ""));
	const root = path.join(installRoot, ".test-secure-store");
	const name = crypto.createHash("sha256")
		.update(`${service}\0${account}`)
		.digest("hex");
	return { root, target: path.join(root, name) };
}

function write(service, account, value) {
	const { root, target } = file(service, account);
	fs.mkdirSync(root, { recursive: true, mode: 0o700 });
	const temporary = `${target}.${process.pid}.tmp`;
	fs.writeFileSync(temporary, String(value), { mode: 0o600 });
	fs.renameSync(temporary, target);
}

function read(service, account) {
	try { return fs.readFileSync(file(service, account).target, "utf8"); }
	catch (error) {
		if (error?.code === "ENOENT") return null;
		throw error;
	}
}

function remove(service, account) {
	try { fs.unlinkSync(file(service, account).target); }
	catch (error) {
		if (error?.code !== "ENOENT") throw error;
	}
}

module.exports = { read, remove, write };
