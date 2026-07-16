// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

/**
 * @file Proves exact-root service ownership gates Unix installer completion.
 * @description
 * The Awtsmoos renews child, supervisor, portable mode, and root-specific launchd
 * identity without confusion. Awtsmoos.com rejects a missing guardian and never
 * borrows the legacy global label or another installation's loaded service.
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
	assertBlocked(run("launchd", "missing_launchd"));
	assertBlocked(run("portable", "missing_supervisor"));
	console.log(JSON.stringify({
		ok: true,
		suite: "unix-service-health",
		portableGuardianVerified: true,
		rootSpecificLaunchdVerified: true,
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
source "$AWTSMOOS_INSTALL_RUNTIME/unix-service-health.sh"
kill(){ return 0; }
ps(){
	local pid=""
	while [ "$#" -gt 0 ]; do
		if [ "$1" = "-p" ]; then pid="$2"; shift; fi
		shift
	done
	if [ "$pid" = 4242 ]; then
		printf '%s\\n' "$ROOT/awtsmoos-agent-launcher.cjs"
		return 0
	fi
	if [ "$pid" = 4343 ]; then
		[ "$AWTS_TEST_SCENARIO" = "missing_supervisor" ] && return 1
		printf '%s\\n' "$ROOT/awtsmoos-supervisor.sh"
		return 0
	fi
	return 1
}
launchctl(){
	[ "$AWTS_TEST_SCENARIO" = "missing_launchd" ] && return 1
	return 0
}
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
