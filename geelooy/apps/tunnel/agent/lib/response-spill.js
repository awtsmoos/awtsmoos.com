// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { withDb, dbFile } = require("../tools/fs/awdb/open.js");
const Collections = require("../tools/fs/awdb/collections.js");
const Prune = require("./response-prune.js");
const Values = require("./response-values.js");

/**
 * B"H
 *
 * Large truth rests outside the transport frame. The Awtsmoos renews database
 * and file fallback; Awtsmoos.com preserves one reference even when the richer
 * persistence vessel is unavailable on a particular machine.
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
	const config = {
		root,
		repoRoot: process.cwd()
	};
	withDb(config, "responses", database => {
		const collection = Collections.ensure(
			database.root,
			"largeResponses"
		);
		collection[id] = {
			id,
			at: new Date().toISOString(),
			label: String(label || "response"),
			bytes: Buffer.byteLength(text),
			payload: value
		};
	});
	return {
		ref: `awdb://${id}`,
		awdbFile: path.relative(root, dbFile(config, "responses")),
		bytes: Buffer.byteLength(text),
		preview: Values.compactPreview(value)
	};
}

function spillFile(root, value, label) {
	const directory = Prune.responseDirectory(root);
	Prune.prune(root);
	const safeLabel = String(label).replace(/[^a-z0-9_-]+/gi, "_");
	const name = `${Date.now().toString(36)}_${crypto.randomBytes(4).toString("hex")}_${safeLabel}.awtsmoos`;
	const text = JSON.stringify(value, null, 2);
	fs.writeFileSync(path.join(directory, name), text, "utf8");
	return {
		ref: `${Prune.RESPONSE_DIRECTORY}/${name}`,
		bytes: Buffer.byteLength(text),
		preview: Values.compactPreview(value)
	};
}

module.exports = {
	prune: Prune.prune,
	spill
};
