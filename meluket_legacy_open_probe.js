// B"H
// Boruch Hashem
// Blessed is He

/**
 * A read-only vessel for revealing the older Awtsmoos social core.
 * It opens no gate of mutation: the source file is fingerprinted before and
 * after, while the preserved lifecycle restores the root pointer written into
 * bytes 8 through 23 of the legacy superblock.
 */

const crypto = require("crypto");
const fs = require("fs");

const engineRoot = "/Users/awtsmoos/tunnel-stability-installer-20260721T081000Z/ayzarim/dosdb/awtsmoosBinary/awtsmoosDB";
const Database = require(`${engineRoot}/database.js`);
const legacyLifecycle = require(`${engineRoot}/core/db/lifecycle.js`);

const sourcePath = "/Users/awtsmoos/Documents/dayuhChadash - Copy/socialPacked/social.core.awtsocial";
const outputPath = "/tmp/meluket_legacy_open_probe.json";

function fingerprint(filePath) {
	const bytes = fs.readFileSync(filePath);
	const stats = fs.statSync(filePath);

	return {
		size: stats.size,
		mtimeMs: stats.mtimeMs,
		sha256: crypto.createHash("sha256").update(bytes).digest("hex")
	};
}

function describeRoot(database) {
	const rootKeys = database.keys(database.root, { limit: 500 }).map(String);
	const children = {};

	for (const key of rootKeys) {
		const value = database.root[key];
		children[key] = {
			type: value === null ? "null" : Array.isArray(value) ? "array" : typeof value
		};

		if (value && typeof value === "object") {
			try {
				children[key].keys = database.keys(value, { limit: 200 }).map(String);
			} catch (error) {
				children[key].keysError = `${error.name}: ${error.message}`;
			}
		}
	}

	return { rootKeys, children };
}

const result = {
	mode: "strict_read_only_legacy_lifecycle",
	sourcePath,
	engineRoot
};

let database = null;

try {
	result.before = fingerprint(sourcePath);
	database = new Database(sourcePath, {
		readOnly: true,
		processLockMode: "shared",
		lockMode: "shared"
	});
	legacyLifecycle.open(database);
	Object.assign(result, describeRoot(database));
} catch (error) {
	result.error = {
		name: error.name,
		code: error.code || null,
		message: error.message,
		stack: error.stack
	};
} finally {
	if (database?.pager) {
		try {
			database.pager.close();
		} catch (error) {
			result.closeError = `${error.name}: ${error.message}`;
		}
	}

	try {
		result.after = fingerprint(sourcePath);
		result.unchanged = JSON.stringify(result.before) === JSON.stringify(result.after);
	} catch (error) {
		result.afterError = `${error.name}: ${error.message}`;
	}

	fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
}
