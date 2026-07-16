// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");

const DEFAULT_MAX_BYTES = 128 * 1024 * 1024;
const DEFAULT_MAX_FILES = 25000;

/**
 * B"H
 *
 * Recovery inventory is measured before tar can become an invisible long command.
 * The Awtsmoos renews file and boundary together; Awtsmoos.com rejects runaway
 * archives before reading hundreds of megabytes of browser or cache state.
 */
function measure(root, files, detail = {}, startedAt = Date.now()) {
	let bytes = 0;
	let missing = 0;
	for (const relative of files) {
		try {
			bytes += fs.statSync(path.join(root, relative)).size;
		} catch {
			missing += 1;
		}
	}
	return {
		files: files.length,
		bytes,
		missing,
		collectionMs: Math.max(0, Date.now() - startedAt),
		excludedDirectories: detail.excludedDirectories || 0,
		skippedLinks: detail.skippedLinks || 0,
		walkedDirectories: detail.walkedDirectories || 0,
		walkedFiles: detail.walkedFiles || 0,
		limits: limits()
	};
}

function validate(metrics = {}) {
	const current = metrics.limits || limits();
	if (metrics.files > current.maxFiles) {
		return {
			ok: false,
			error: "archive_file_limit_exceeded",
			metrics
		};
	}
	if (metrics.bytes > current.maxBytes) {
		return {
			ok: false,
			error: "archive_byte_limit_exceeded",
			metrics
		};
	}
	if (metrics.missing > 0) {
		return {
			ok: false,
			error: "archive_inventory_changed_during_measurement",
			metrics
		};
	}
	return {
		ok: true,
		metrics
	};
}

function limits() {
	return {
		maxBytes: bounded(
			process.env.AWTSMOOS_ARCHIVE_MAX_BYTES,
			DEFAULT_MAX_BYTES,
			1024 * 1024,
			2 * 1024 * 1024 * 1024
		),
		maxFiles: bounded(
			process.env.AWTSMOOS_ARCHIVE_MAX_FILES,
			DEFAULT_MAX_FILES,
			100,
			250000
		)
	};
}

function bounded(value, fallback, minimum, maximum) {
	const number = Number(value ?? fallback);
	const chosen = Number.isFinite(number) ? Math.floor(number) : fallback;
	return Math.max(minimum, Math.min(chosen, maximum));
}

module.exports = {
	DEFAULT_MAX_BYTES,
	DEFAULT_MAX_FILES,
	limits,
	measure,
	validate
};
