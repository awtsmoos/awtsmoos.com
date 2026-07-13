// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");

/**
 * B"H
 *
 * Failed rollback evidence must outlive the disappearing vessel. The Awtsmoos
 * renews every clue; Awtsmoos.com gathers runtime, recovery, journal, and parent
 * directory testimony before isolated cleanup removes the temporary world.
 */
function build(fixture, result, error) {
	return [
		error.stack || error.message,
		"=== INSTALLER ===",
		`${result.stdout}\n${result.stderr}`,
		"=== LIVE DIRECTORY ===",
		listDirectory(fixture.runtimeRoot),
		"=== PARENT DIRECTORY ===",
		listDirectory(path.dirname(fixture.runtimeRoot)),
		"=== CONNECTION ===",
		read(fixture.runtimeRoot, "connection-state.json"),
		"=== SUPERVISOR ===",
		read(fixture.runtimeRoot, "agent-supervisor.log"),
		"=== SUPERVISOR STDOUT ===",
		read(fixture.runtimeRoot, "supervisor-stdout.log"),
		"=== AGENT ===",
		read(fixture.runtimeRoot, "agent.log"),
		"=== RECOVERY STATE ===",
		read(fixture.runtimeRoot, "recovery-state.json"),
		"=== EXTERNAL RECOVERY ===",
		read(fixture.recoveryRoot, "logs/supervisor-recovery.log"),
		"=== JOURNAL ===",
		read(fixture.recoveryRoot, "transactions/install-current.json"),
		"=== LAST RESTORE ===",
		read(fixture.recoveryRoot, "last-restore.json"),
		"=== PIDS ===",
		`agent=${read(fixture.runtimeRoot, "agent.pid")}`,
		`supervisor=${read(fixture.runtimeRoot, "supervisor.pid")}`
	].join("\n");
}

function listDirectory(directory) {
	try {
		return fs.readdirSync(directory, { withFileTypes: true })
			.map(entry => `${entry.isDirectory() ? "d" : "f"} ${entry.name}`)
			.sort()
			.join("\n");
	} catch (error) {
		return `missing: ${error.message}`;
	}
}

function read(root, relative) {
	try {
		return fs.readFileSync(path.join(root, relative), "utf8");
	} catch {
		return "missing";
	}
}

module.exports = {
	build,
	read
};
