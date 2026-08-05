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

/** Copies runtime code while leaving process testimony and volatile logs behind. */
function copy(source, destination) {
	fs.cpSync(source, destination, {
		recursive: true,
		preserveTimestamps: true,
		filter: (candidate) => allowed(source, candidate)
	});
	return destination;
}

function allowed(source, candidate) {
	if (path.resolve(candidate) === path.resolve(source)) return true;
	const relative = path.relative(source, candidate);
	const pieces = relative.split(path.sep);
	const base = path.basename(candidate);
	if (VOLATILE.has(base)) return false;
	if (pieces.some(piece => piece.endsWith(".lock"))) return false;
	if (/\.(?:log|pid)$/.test(base)) return false;
	if (/^(?:agent|launchd|candidate-probe|legacy-agent)\./.test(base)) return false;
	return true;
}

function remove(target) {
	fs.rmSync(target, { recursive: true, force: true, maxRetries: 5, retryDelay: 50 });
}

module.exports = { VOLATILE, allowed, copy, remove };
