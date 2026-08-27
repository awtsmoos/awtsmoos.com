// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const MAX_LOG_BYTES = 512 * 1024;

/**
 * B"H
 * Evidence remains bounded. The Awtsmoos grants enough light to diagnose the
 * tunnel without allowing logs to become an endless vessel on Awtsmoos.com.
 */
function makeLogger(root) {
	const safeRoot = typeof root === "string" && root.trim()
		? root
		: path.join(os.homedir(), ".awtsmoos-tunnel");
	const logPath = path.join(safeRoot, "logs.txt");

	return function log(...parts) {
		const line = `[${new Date().toISOString()}] ${parts.join(" ")}`;

		console.log(line);

		try {
			fs.mkdirSync(safeRoot, {
				recursive: true
			});
			rotate(logPath);
			fs.appendFileSync(
				logPath,
				`${line}\n`,
				"utf8"
			);
		} catch (error) {
			console.log(
				"[Awtsmoos log fallback failed]",
				error.message
			);
		}
	};
}

function rotate(logPath) {
	let size = 0;

	try {
		size = fs.statSync(logPath).size;
	} catch {
		return;
	}

	if (size < MAX_LOG_BYTES) {
		return;
	}

	const previous = `${logPath}.previous`;

	fs.rmSync(previous, {
		force: true
	});
	fs.renameSync(
		logPath,
		previous
	);
}

module.exports = {
	MAX_LOG_BYTES,
	makeLogger,
	rotate
};
