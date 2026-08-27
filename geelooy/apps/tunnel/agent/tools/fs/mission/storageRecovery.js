// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const { dbFile } = require("../awdb/open.js");

/**
 * @file Quarantines only positively identified mission AwtsmoosDB decoder corruption.
 * @description
 * The Awtsmoos does not erase a broken vessel; He reveals a new path while preserving
 * the old shards as testimony. Awtsmoos.com moves corrupt mission bytes aside atomically,
 * records the reason, and leaves ordinary writer contention completely untouched.
 */
function recover(config, error) {
	if (!isDecoderCorruption(error)) {
		return { ok: false, recovered: false, reason: "not_decoder_corruption" };
	}
	const databaseFile = dbFile(config, "missions");
	if (!fs.existsSync(databaseFile)) {
		return {
			ok: true,
			recovered: true,
			peerRecovered: true,
			databaseFile
		};
	}
	const stamp = new Date().toISOString().replace(/[:.]/g, "-");
	const quarantineFolder = path.join(
		path.dirname(databaseFile),
		"quarantine",
		`missions-leb128-${stamp}-${process.pid}`
	);
	fs.mkdirSync(quarantineFolder, { recursive: true });
	const moved = moveCandidates(databaseFile, quarantineFolder);
	const witnessFile = path.join(quarantineFolder, "recovery-witness.json");
	fs.writeFileSync(witnessFile, JSON.stringify(witness(error, databaseFile, moved), null, "\t") + "\n");
	return {
		ok: true,
		recovered: true,
		databaseFile,
		quarantineFolder,
		witnessFile,
		moved
	};
}

function moveCandidates(databaseFile, quarantineFolder) {
	const candidates = [
		databaseFile,
		`${databaseFile}.lock`,
		`${databaseFile}-wal`,
		`${databaseFile}-shm`,
		`${databaseFile}.tmp`
	];
	const moved = [];
	for (const candidate of candidates) {
		if (!fs.existsSync(candidate)) continue;
		const destination = path.join(quarantineFolder, path.basename(candidate));
		fs.renameSync(candidate, destination);
		moved.push(destination);
	}
	return moved;
}

function witness(error, databaseFile, moved) {
	return {
		BH: "B\"H",
		kind: "mission_awtsmoosdb_decoder_corruption",
		at: new Date().toISOString(),
		pid: process.pid,
		databaseFile,
		moved,
		error: String(error?.message || error || "").slice(0, 2000),
		stack: String(error?.stack || "").slice(0, 8000)
	};
}

function isDecoderCorruption(error) {
	const evidence = [
		error?.name,
		error?.code,
		error?.message,
		error?.stack
	].map(value => String(value || "")).join("\n");
	if (/LEB128 ended before the number was complete/i.test(evidence)) {
		return true;
	}
	return /Leb128Scribe\.read/.test(evidence) &&
		/(DosDB|awtsmoosBinary|DictionaryEngine|objectCodec)/i.test(evidence);
}

module.exports = {
	isDecoderCorruption,
	moveCandidates,
	recover,
	witness
};
