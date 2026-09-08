// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const test = require("node:test");

/**
 * @file Drives the real supervisor monitor through a simulated day-long outage.
 * @description
 * The Awtsmoos lets one living child cross twenty-eight dark network hours untouched.
 * Awtsmoos.com proves elapsed time alone never creates registration_lost, while
 * the same monitor still exits when retry testimony becomes hard failure.
 */
const source = path.resolve(__dirname, "../../downloads/unix-supervisor-health.sh");

test("real monitor preserves one child through more than one offline day", () => {
	const result = invokeMonitor(true, 14, 1);
	assert.equal(result.status, 0, result.stderr || result.stdout);
	assert.match(result.stdout, /monitor_status=1/);
	assert.match(result.stdout, /simulated_hours=28/);
	assert.doesNotMatch(result.events, /registration_lost/);
	assert.match(result.events, /registration_network_wait/);
});

test("real monitor distinguishes hard failure and returns registration_lost", () => {
	const result = invokeMonitor(false, 4, 2);
	assert.equal(result.status, 0, result.stderr || result.stdout);
	assert.match(result.stdout, /monitor_status=2/);
	assert.match(result.events, /registration_lost/);
});

function invokeMonitor(networkRecovering, maximumLoops, expectedStatus) {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-supervisor-outage-"));
	const eventsFile = path.join(root, "events.log");
	const script = [
		"set -u",
		`ROOT=${quote(root)}`,
		"CHILD_PID=4242",
		`STOP_FILE=${quote(path.join(root, "never-stop"))}`,
		"fake_now=1700000000",
		"loops=0",
		`maximum_loops=${maximumLoops}`,
		`network_recovering=${networkRecovering ? 1 : 0}`,
		`events_file=${quote(eventsFile)}`,
		`source ${quote(source)}`,
		"supervisor_alive(){ [ \"$loops\" -lt \"$maximum_loops\" ]; }",
		"supervisor_registered_receipt_matches(){ return 1; }",
		"mark_supervisor_healthy(){ return 0; }",
		"supervisor_receipt_summary(){ printf '%s' 'simulated'; }",
		"network_grace_available(){ [ \"$network_recovering\" -eq 1 ]; }",
		"supervisor_log(){ printf '%s\\n' \"$1\" >> \"$events_file\"; }",
		"date(){ [ \"${1:-}\" = '+%s' ] && printf '%s\\n' \"$fake_now\" || command date \"$@\"; }",
		"sleep(){ loops=$((loops + 1)); fake_now=$((fake_now + 7200)); }",
		"AWTSMOOS_RECONNECT_GRACE_SECONDS=1",
		"monitor_registered_child",
		"monitor_status=$?",
		"printf 'monitor_status=%s\\n' \"$monitor_status\"",
		"printf 'simulated_hours=%s\\n' \"$((loops * 2))\"",
		`[ "$monitor_status" -eq ${expectedStatus} ]`
	].join("\n");
	const result = spawnSync("bash", ["-c", script], { encoding: "utf8" });
	result.events = fs.existsSync(eventsFile) ? fs.readFileSync(eventsFile, "utf8") : "";
	fs.rmSync(root, { recursive: true, force: true });
	return result;
}

function quote(value) {
	return `'${String(value).replaceAll("'", "'\\''")}'`;
}
