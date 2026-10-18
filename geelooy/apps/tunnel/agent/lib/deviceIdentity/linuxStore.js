// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

/**
 * @file Linux file-backed secure store for tunnel device identity.
 * @description
 * Linux has no single OS keychain; this adapter seals each secret with
 * AES-256-GCM under a machine-bound key and keeps the files at 0600 inside a
 * 0700 directory under the install root. Same write/read/remove surface as the
 * macOS keychain adapter, so pairing works on servers and SSH machines.
 */

const STORE_DIRNAME = ".linux-secure-store";

function machineKey() {
	let machineId = "";
	for (const candidate of ["/etc/machine-id", "/var/lib/dbus/machine-id"]) {
		try { machineId = fs.readFileSync(candidate, "utf8").trim(); break; }
		catch {}
	}
	return crypto.createHash("sha256")
		.update(`awtsmoos-linux-secure-store\0${os.hostname()}\0${machineId}`)
		.digest();
}

function file(service, account) {
	// B"H — authorized secrets must outlive replaceable candidate/runtime
	// directories. The installer migrates older encrypted files before update.
	const recoveryRoot = path.resolve(String(process.env.AWTSMOOS_RECOVERY_ROOT ||
		path.join(os.homedir(), ".awtsmoos-tunnel-recovery")));
	const root = path.join(recoveryRoot, "state", "private", STORE_DIRNAME);
	const name = crypto.createHash("sha256")
		.update(`${service}\0${account}`)
		.digest("hex");
	return { root, target: path.join(root, name) };
}

function seal(value) {
	const key = machineKey();
	const iv = crypto.randomBytes(12);
	const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
	const body = Buffer.concat([cipher.update(String(value), "utf8"), cipher.final()]);
	const tag = cipher.getAuthTag();
	return Buffer.concat([iv, tag, body]).toString("base64");
}

function open(payload) {
	const raw = Buffer.from(String(payload), "base64");
	const iv = raw.subarray(0, 12);
	const tag = raw.subarray(12, 28);
	const body = raw.subarray(28);
	const decipher = crypto.createDecipheriv("aes-256-gcm", machineKey(), iv);
	decipher.setAuthTag(tag);
	return Buffer.concat([decipher.update(body), decipher.final()]).toString("utf8");
}

function write(service, account, value) {
	const { root, target } = file(service, account);
	fs.mkdirSync(root, { recursive: true, mode: 0o700 });
	const temporary = `${target}.${process.pid}.tmp`;
	fs.writeFileSync(temporary, seal(value), { mode: 0o600 });
	fs.renameSync(temporary, target);
}

function read(service, account) {
	let payload;
	try { payload = fs.readFileSync(file(service, account).target, "utf8"); }
	catch (error) {
		if (error?.code === "ENOENT") return null;
		throw error;
	}
	try { return open(payload); }
	catch { return null; }
}

function remove(service, account) {
	try { fs.unlinkSync(file(service, account).target); }
	catch (error) {
		if (error?.code !== "ENOENT") throw error;
	}
}

module.exports = { read, remove, write };
