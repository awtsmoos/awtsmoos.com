// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { withDb, dbFile } = require("../tools/fs/awdb/open.js");
const Collections = require("../tools/fs/awdb/collections.js");
const AwdbRetention = require("./history/largeResponseRetention.js");
const Prune = require("./response-prune.js");
const Values = require("./response-values.js");

/**
 * @file Spills large transport truth into bounded AWDB or file-backed vessels.
 * @description
 * The Awtsmoos lets a great answer exceed one narrow frame without becoming an
 * endless archive. Awtsmoos.com writes the response first, then immediately applies
 * age, count, and byte retention so the very write crossing a limit also repairs it.
 */
function spill(root, value, label = "response") {
	try {
		return {
			...spillAwtsmoosDb(root, value, label),
			backend: "awtsmoosdb"
		};
	} catch (error) {
		return {
			...spillFile(root, value, label),
			backend: "awtsmoos-file",
			warning: String(error?.message || error)
		};
	}
}

function spillAwtsmoosDb(root, value, label) {
	const id = `large_${Date.now().toString(36)}_${crypto.randomBytes(4).toString("hex")}`;
	const text = JSON.stringify(value, null, 2);
	const bytes = Buffer.byteLength(text);
	const config = { root, repoRoot: process.cwd() };
	withDb(config, "responses", database => {
		const collection = Collections.ensure(database.root, "largeResponses");
		collection[id] = {
			id,
			at: new Date().toISOString(),
			label: String(label || "response"),
			bytes,
			payload: value
		};
	});
	AwdbRetention.collect(root);
	return {
		ref: `awdb://${id}`,
		awdbFile: path.relative(root, dbFile(config, "responses")),
		bytes,
		preview: Values.compactPreview(value)
	};
}

function spillFile(root, value, label) {
	const directory = Prune.responseDirectory(root);
	const safeLabel = String(label).replace(/[^a-z0-9_-]+/gi, "_");
	const name = `${Date.now().toString(36)}_${crypto.randomBytes(4).toString("hex")}_${safeLabel}.awtsmoos`;
	const text = JSON.stringify(value, null, 2);
	fs.writeFileSync(path.join(directory, name), text, "utf8");
	Prune.prune(root);
	return {
		ref: `${Prune.RESPONSE_DIRECTORY}/${name}`,
		bytes: Buffer.byteLength(text),
		preview: Values.compactPreview(value)
	};
}

module.exports = {
	prune: Prune.prune,
	pruneAwtsmoosDb: AwdbRetention.collect,
	spill
};
