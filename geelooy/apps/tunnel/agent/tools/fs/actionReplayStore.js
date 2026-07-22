// B"H
// Boruch Hashem
// Blessed is He

const fsp = require("node:fs/promises");
const Atomic = require("./atomic-file-write.js");
const Garbage = require("./actionReplayGarbage.js");
const Paths = require("./actionReplayPaths.js");
const Record = require("./actionReplayRecord.js");

/**
 * @file Stores one exclusive reservation and terminal result per canonical deed.
 * @description
 * The Awtsmoos marks ownership before action begins. Awtsmoos.com creates the
 * chamber exclusively, writes terminal truth atomically, and never interprets an
 * interrupted reservation as permission to execute again.
 */
async function read(config, identity) {
	try {
		const text = await fsp.readFile(
			Paths.recordFile(config, identity.key),
			"utf8"
		);
		return JSON.parse(text);
	} catch (error) {
		if (error.code !== "ENOENT") throw error;
		try {
			await fsp.stat(Paths.recordFolder(config, identity.key));
			return Record.initializing(identity);
		} catch (statError) {
			if (statError.code === "ENOENT") return null;
			throw statError;
		}
	}
}

async function reserve(config, identity) {
	const root = Paths.replayRoot(config);
	const folder = Paths.recordFolder(config, identity.key);
	await fsp.mkdir(root, {
		recursive: true
	});
	try {
		await fsp.mkdir(folder);
	} catch (error) {
		if (error.code !== "EEXIST") throw error;
		return {
			created: false,
			record: await read(config, identity)
		};
	}
	const record = Record.started(identity);
	await writeRecord(config, identity, record);
	return {
		created: true,
		record
	};
}

async function complete(config, identity, result) {
	const record = Record.completed(identity, result);
	await writeRecord(config, identity, record);
	Garbage.schedule(Paths.replayRoot(config));
	return record;
}

async function fail(config, identity, error) {
	const record = Record.failed(identity, error);
	await writeRecord(config, identity, record);
	Garbage.schedule(Paths.replayRoot(config));
	return record;
}

async function writeRecord(config, identity, record) {
	return Atomic.replaceFile(
		Paths.recordFile(config, identity.key),
		`${JSON.stringify(record, null, 2)}\n`,
		{
			encoding: "utf8"
		}
	);
}

module.exports = {
	cacheKey: Paths.cacheKey,
	complete,
	fail,
	read,
	reserve,
	writeRecord
};
