// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

/**
 * @file Proves exact-root service ownership and singleton counts gate completion.
 * @description
 * The Awtsmoos renews child, supervisor, and outer service without confusion.
 * Awtsmoos.com accepts one agent and one guardian, rejects missing or duplicate bodies,
 * and never borrows the legacy global launchd label from another installation.
 */
const repositoryRoot = path.resolve(__dirname, "../../../../..");
const downloads = path.join(repositoryRoot, "geelooy/apps/tunnel/downloads");
const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), "awts-service-health-"));
const root = path.join(sandbox, "root");
fs.mkdirSync(root);
fs.writeFileSync(path.join(root, "agent.pid"), "4242\n");
fs.writeFileSync(path.join(root, "supervisor.pid"), "4343\n");

try {
	assertReady(run("portable", "ready"));
	const launchd = run("launchd", "ready");
	assertReady(launchd);
	assert.match(launchd.stdout, /com\.awtsmoos\.tunnel\.[a-f0-9]{12}/);
	assert.doesNotMatch(launchd.stdout, /outer=launchd_loaded:com\.awtsmoos\.tunnel\s/);
	for (const scenario of [
		"missing_launchd",
		"missing_supervisor",
		"duplicate_agent",
		"duplicate_supervisor"
	]) {
		assertBlocked(run(scenario === "missing_launchd" ? "launchd" : "portable", scenario));
	}
	console.log(JSON.stringify({
		ok: true,
		suite: "unix-service-health",
		portableGuardianVerified: true,
		rootSpecificLaunchdVerified: true,
		duplicateProcessesRejected: true,
		legacyGlobalLabelRejected: true
	}, null, 2));
} finally {
	fs.rmSync(sandbox, { recursive: true, force: true });
}

function run(mode, scenario) {
	return spawnSync("bash", ["-c", script()], {
		encoding: "utf8",
		env: {
			...process.env,
			ROOT: root,
			AWTSMOOS_INSTALL_RUNTIME: downloads,
			AWTSMOOS_SERVICE_MODE: mode,
			AWTS_TEST_SCENARIO: scenario
		}
	});
}

function script() {
	return `set -u
source "$AWTSMOOS_INSTALL_RUNTIME/unix-service-identity.sh"
find_agent_pids(){
	printf '4242\\n'
	[ "$AWTS_TEST_SCENARIO" = duplicate_agent ] && printf '4243\\n'
}
find_supervisor_pids(){
	printf '4343\\n'
	[ "$AWTS_TEST_SCENARIO" = duplicate_supervisor ] && printf '4344\\n'
}
kill(){ return 0; }
ps(){
	local pid=""
	while [ "$#" -gt 0 ]; do
		[ "$1" = "-p" ] && pid="$2" && shift
		shift
	done
	[ "$pid" = 4242 ] && printf '%s\\n' "$ROOT/awtsmoos-agent-launcher.cjs" && return 0
	if [ "$pid" = 4343 ]; then
		[ "$AWTS_TEST_SCENARIO" = missing_supervisor ] && return 1
		printf '%s\\n' "$ROOT/awtsmoos-supervisor.sh"
		return 0
	fi
	return 1
}
launchctl(){ [ "$AWTS_TEST_SCENARIO" != missing_launchd ]; }
source "$AWTSMOOS_INSTALL_RUNTIME/unix-service-health.sh"
if service_supervision_ready; then
	echo READY
	service_health_summary
	exit 0
fi
echo BLOCKED
service_health_summary
exit 9`;
}

function assertReady(result) {
	assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
	assert.match(result.stdout, /READY/);
}

function assertBlocked(result) {
	assert.equal(result.status, 9, `${result.stdout}\n${result.stderr}`);
	assert.match(result.stdout, /BLOCKED/);
}
