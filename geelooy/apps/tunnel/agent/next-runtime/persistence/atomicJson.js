// B"H
const fs = require("node:fs");
const path = require("node:path");

/**
 * B"H — Intent is written into a new vessel, flushed, and only then renamed
 * over the visible state. A crash may leave a temporary shell, but never half
 * of a JSON truth pretending to be whole.
 */
function createAtomicJson(filePath, initialValue = {}) {
	function read() {
		try {
			return JSON.parse(fs.readFileSync(filePath, "utf8"));
		} catch (error) {
			if (error.code === "ENOENT") return structuredClone(initialValue);
			throw error;
		}
	}

	function write(value) {
		fs.mkdirSync(path.dirname(filePath), { recursive: true });
		const temporary = `${filePath}.${process.pid}.${Date.now()}.tmp`;
		const descriptor = fs.openSync(temporary, "wx", 0o600);
		try {
			fs.writeFileSync(descriptor, `${JSON.stringify(value, null, 2)}\n`, "utf8");
			fs.fsyncSync(descriptor);
		} finally {
			fs.closeSync(descriptor);
		}
		fs.renameSync(temporary, filePath);
		return structuredClone(value);
	}

	function removeTemporaryFiles() {
		const directory = path.dirname(filePath);
		const prefix = `${path.basename(filePath)}.`;
		if (!fs.existsSync(directory)) return 0;
		let removed = 0;
		for (const name of fs.readdirSync(directory)) {
			if (!name.startsWith(prefix) || !name.endsWith(".tmp")) continue;
			fs.rmSync(path.join(directory, name), { force: true });
			removed += 1;
		}
		return removed;
	}

	return { filePath, read, removeTemporaryFiles, write };
}

module.exports = { createAtomicJson };
