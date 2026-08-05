// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

/**
 * @file Proves adoption releases stale activation and spawn restores its binding.
 * @description
 * The Awtsmoos receives a healthy exact-root rescue without yesterday's garment,
 * then Awtsmoos.com restores launchd testimony before creating the next body.
 */
const repositoryRoot = path.resolve(__dirname, "../../../../..");
const runtimeSource = path.join(
	repositoryRoot,
	"geelooy/apps/tunnel/downloads/unix-supervisor-runtime.sh"
);
const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-adopted-activation-"));

try {
	const result = spawnSync("bash", ["-c", shellScript()], {
		encoding: "utf8",
		env: {
			...process.env,
			ROOT: root,
			RUNTIME_SOURCE: runtimeSource,
			AWTSMOOS_ACTIVATION_ID: "stale-activation",
			AWTSMOOS_RUNTIME_VERSION: "1.0.495"
		}
	});
	assert.equal(result.status, 0, result.stderr || result.stdout);
	const value = JSON.parse(result.stdout);
	assert.equal(value.childPid, 4242);
	assert.equal(value.childOwned, 0);
	assert.equal(value.adoptedActivationPresent, false);
	assert.equal(value.restoredActivation, "stale-activation");
	assert.equal(value.runtimeVersion, "1.0.495");
	assert.equal(fs.readFileSync(path.join(root, "agent.pid"), "utf8").trim(), "4242");
	assert.match(fs.readFileSync(path.join(root, "supervisor.log"), "utf8"), /adopted_unbound/);
	console.log(JSON.stringify({
		ok: true,
		suite: "supervisor-adopted-activation",
		staleActivationReleased: true,
		spawnActivationRestored: true
	}, null, 2));
} finally {
	fs.rmSync(root, { recursive: true, force: true });
}

function shellScript() {
	return `set -u
LOG="$ROOT/supervisor.log"
PID_FILE="$ROOT/agent.pid"
CHILD_PID=""
CHILD_OWNED=1
CHILD_KIND="unknown"
SUPERVISOR_ACTIVATION_ID="$AWTSMOOS_ACTIVATION_ID"
source "$RUNTIME_SOURCE"
adopt_existing_agent 4242 test_adoption
ADOPTED_ACTIVATION="\${AWTSMOOS_ACTIVATION_ID-}"
bind_supervisor_activation
node -e 'console.log(JSON.stringify({childPid:Number(process.argv[1]),childOwned:Number(process.argv[2]),adoptedActivationPresent:Boolean(process.argv[3]),restoredActivation:process.argv[4],runtimeVersion:process.env.AWTSMOOS_RUNTIME_VERSION}))' "$CHILD_PID" "$CHILD_OWNED" "$ADOPTED_ACTIVATION" "$AWTSMOOS_ACTIVATION_ID"`;
}
