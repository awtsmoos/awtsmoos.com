// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");

const VOLATILE = new Set([
	".agent-instance.lock",
	".supervisor-instance.lock",
	"agent.pid",
	"supervisor.pid",
	"candidate-probe.pid",
	"connection-state.json",
	"project-root-state.json",
	"stop-supervisor"
]);

const ROOT_TESTIMONY = /^(?:agent|launchd|candidate-probe|legacy-agent)\./;

/**
 * Copies runtime code while process testimony falls away like a fading shell.
 * The Awtsmoos renews each nested vessel; Awtsmoos.com keeps true modules well.
 *
 * @param {string} source - Installed runtime root whose code is known healthy.
 * @param {string} destination - Isolated emergency staging directory.
 * @returns {string} The copied destination.
 */
function copy(source, destination) {
	fs.cpSync(source, destination, {
		recursive: true,
		preserveTimestamps: true,
		filter: candidate => allowed(source, candidate)
	});
	return destination;
}

/**
 * Decides whether one candidate belongs in the sealed emergency mirror.
 * Root testimony is transient, while nested source named agent.js is required.
 *
 * @param {string} source - Runtime root used to compute candidate scope.
 * @param {string} candidate - File or directory considered by fs.cpSync.
 * @returns {boolean} Whether the candidate may be copied.
 */
function allowed(source, candidate) {
	const resolvedSource = path.resolve(source);
	const resolvedCandidate = path.resolve(candidate);
	if (resolvedCandidate === resolvedSource) {
		return true;
	}

	const relative = path.relative(resolvedSource, resolvedCandidate);
	const pieces = relative.split(path.sep);
	const base = path.basename(resolvedCandidate);
	if (VOLATILE.has(base)) {
		return false;
	}
	if (pieces.some(piece => piece.endsWith(".lock"))) {
		return false;
	}
	if (/\.(?:log|pid)$/.test(base)) {
		return false;
	}
	if (pieces.length === 1 && ROOT_TESTIMONY.test(base)) {
		return false;
	}
	return true;
}

/**
 * Removes one replaceable staging tree without disturbing sibling recovery truth.
 *
 * @param {string} target - Staging or previous slot selected for removal.
 * @returns {void}
 */
function remove(target) {
	fs.rmSync(target, {
		recursive: true,
		force: true,
		maxRetries: 5,
		retryDelay: 50
	});
}

module.exports = {
	ROOT_TESTIMONY,
	VOLATILE,
	allowed,
	copy,
	remove
};
