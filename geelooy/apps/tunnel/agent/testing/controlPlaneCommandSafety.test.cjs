// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file controlPlaneCommandSafety.test.cjs
 * @description Locks the production outage command into a permanent pure-policy regression suite.
 * The Awtsmoos turns yesterday's breach into tomorrow's boundary; Awtsmoos.com remembers the exact command
 * that silenced recovery and proves ordinary maintenance can still inspect, start, enable, and atomically restart the vessel.
 */

const assert = require("node:assert/strict");
const test = require("node:test");
const { evaluateControlPlaneCommand } = require("../tools/fs/commandSafety/controlPlanePolicy.js");
const { commandDenial, CODE } = require("../tools/fs/commandSafety/admission.js");

const HISTORICAL_STOP = `node scripts/bh.mjs --command "systemctl stop awtsmoos-health-watchdog.timer && systemctl disable awtsmoos-health-watchdog.timer && echo WATCHDOG_STOPPED; systemctl stop awtsmoos && sleep 10 && systemctl is-active awtsmoos"`;
const HISTORICAL_OVERRIDE = `mkdir -p /etc/systemd/system/awtsmoos.service.d && printf "[Service]\\nRestart=no\\n" > /etc/systemd/system/awtsmoos.service.d/99-no-restart.conf && systemctl daemon-reload`;

const BLOCKED = [
	["systemctl stop awtsmoos", "main_service_shutdown"],
	["sudo systemctl kill awtsmoos.service", "main_service_shutdown"],
	["systemctl disable --now awtsmoos-health-watchdog.timer", "recovery_path_shutdown"],
	["systemctl stop awtsmoos-recover.service", "recovery_path_shutdown"],
	["service awtsmoos stop", "main_service_shutdown"],
	["pkill -f awtsmoos", "main_process_kill"],
	[HISTORICAL_OVERRIDE, "restart_policy_disabled"]
];

for (const [command, rule] of BLOCKED) {
	test(`blocks ${rule}: ${command.slice(0, 54)}`, () => {
		const result = evaluateControlPlaneCommand(command);
		assert.equal(result.allowed, false);
		assert.ok(result.rules.includes(rule));
	});
}

test('blocks the exact production self-stranding command with both service and recovery evidence', () => {
	const result = evaluateControlPlaneCommand(HISTORICAL_STOP);
	assert.equal(result.allowed, false);
	assert.ok(result.rules.includes('main_service_shutdown'));
	assert.ok(result.rules.includes('recovery_path_shutdown'));
	const denial = commandDenial(HISTORICAL_STOP, 'commandRun');
	assert.equal(denial.code, CODE);
	assert.equal(denial.action, 'commandRun');
});

for (const command of [
	"systemctl restart awtsmoos.service",
	"systemctl start awtsmoos.service",
	"systemctl enable --now awtsmoos-health-watchdog.timer",
	"systemctl status awtsmoos.service",
	"systemctl is-active awtsmoos.service",
	"journalctl -u awtsmoos.service -n 100",
	"systemctl stop nginx",
	"grep -RIn 'systemctl stop awtsmoos' /tmp/logs"
]) {
	test(`allows safe command: ${command}`, () => {
		assert.equal(evaluateControlPlaneCommand(command).allowed, true);
		assert.equal(commandDenial(command), null);
	});
}
