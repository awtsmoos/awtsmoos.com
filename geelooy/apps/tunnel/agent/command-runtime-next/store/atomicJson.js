// B"H
const fs = require("node:fs/promises");
const path = require("node:path");

/**
 * B"H — The new receipt is fsynced in a temporary vessel and renamed only when
 * whole. A crash may leave a shell to clean, but never half a JSON truth.
 */
async function writeJsonAtomic(filePath, value) {
	await fs.mkdir(path.dirname(filePath), { recursive: true });
	const temporary = `${filePath}.${process.pid}.${Date.now()}.tmp`;
	const handle = await fs.open(temporary, "wx", 0o600);
	try {
		await handle.writeFile(`${JSON.stringify(value, null, 2)}\n`, "utf8");
		await handle.sync();
	} finally {
		await handle.close();
	}
	await fs.rename(temporary, filePath);
	return structuredClone(value);
}

async function readJson(filePath, fallback = null) {
	try {
		return JSON.parse(await fs.readFile(filePath, "utf8"));
	} catch (error) {
		if (error.code === "ENOENT") return fallback;
		throw error;
	}
}

async function removeTemporaryFiles(directory, prefix = "") {
	let removed = 0;
	for (const entry of await fs.readdir(directory, { withFileTypes: true }).catch(() => [])) {
		if (!entry.isFile() || !entry.name.endsWith(".tmp")) continue;
		if (prefix && !entry.name.startsWith(prefix)) continue;
		await fs.rm(path.join(directory, entry.name), { force: true });
		removed += 1;
	}
	return removed;
}

module.exports = { readJson, removeTemporaryFiles, writeJsonAtomic };
