// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const fs = require("node:fs");
const fsp = require("node:fs/promises");
const path = require("node:path");
const Paths = require("./durablePaths.js");
const Record = require("./durableRecord.js");

/**
 * @file Atomically claims and commits canonical relay state with readback proof.
 * @description
 * The Awtsmoos permits no half-written control identity. Awtsmoos.com creates the
 * first claim exclusively, fsyncs every record, renames terminal truth atomically,
 * fsyncs its directory, and rereads exact bytes before callers may trust completion.
 */
async function read(context, key) {
	try {
		const bytes = await fsp.readFile(Paths.recordPath(context, key));
		const record = JSON.parse(bytes.toString("utf8"));
		return Record.valid(record, key) ? record : null;
	} catch (error) {
		if (error.code === "ENOENT") return null;
		throw error;
	}
}

async function claim(context, key, id, expected) {
	const target = Paths.recordPath(context, key);
	await fsp.mkdir(path.dirname(target), { recursive: true });
	const record = Record.pending(key, id, expected);
	const bytes = serialize(record);
	let handle;
	try {
		handle = await fsp.open(target, "wx", 0o600);
		await handle.writeFile(bytes);
		await handle.sync();
		await handle.close();
		handle = null;
		await syncDirectory(path.dirname(target));
		return {
			created: true,
			record: await verifiedRead(context, key, bytes)
		};
	} catch (error) {
		if (handle) await handle.close().catch(() => {});
		if (error.code !== "EEXIST") throw error;
		return {
			created: false,
			record: await read(context, key)
		};
	}
}

async function replace(context, key, record) {
	const target = Paths.recordPath(context, key);
	const folder = path.dirname(target);
	const temporary = `${target}.${process.pid}.${crypto.randomBytes(5).toString("hex")}.tmp`;
	const bytes = serialize(record);
	await fsp.mkdir(folder, { recursive: true });
	let handle;
	try {
		handle = await fsp.open(temporary, "wx", 0o600);
		await handle.writeFile(bytes);
		await handle.sync();
		await handle.close();
		handle = null;
		await fsp.rename(temporary, target);
		await syncDirectory(folder);
		return await verifiedRead(context, key, bytes);
	} finally {
		if (handle) await handle.close().catch(() => {});
		await fsp.rm(temporary, { force: true }).catch(() => {});
	}
}

async function verifiedRead(context, key, intended) {
	const target = Paths.recordPath(context, key);
	const observed = await fsp.readFile(target);
	if (sha256(observed) !== sha256(intended)) {
		throw new Error("durable_relay_record_verification_failed");
	}
	const record = JSON.parse(observed.toString("utf8"));
	if (!Record.valid(record, key)) {
		throw new Error("durable_relay_record_invalid");
	}
	return record;
}

function serialize(record) {
	return Buffer.from(`${JSON.stringify(record)}\n`, "utf8");
}

function sha256(value) {
	return crypto.createHash("sha256").update(value).digest("hex");
}

async function syncDirectory(folder) {
	try {
		const handle = await fsp.open(folder, fs.constants.O_RDONLY);
		try {
			await handle.sync();
		} finally {
			await handle.close();
		}
	} catch {}
}

module.exports = {
	claim,
	read,
	replace,
	serialize,
	sha256,
	syncDirectory,
	verifiedRead
};
