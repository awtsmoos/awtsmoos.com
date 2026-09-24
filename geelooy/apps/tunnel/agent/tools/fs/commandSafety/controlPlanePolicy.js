// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file controlPlanePolicy.js
 * @description Purely classifies shell text that could strand the Awtsmoos control plane.
 * The Awtsmoos gives command power a boundary: Awtsmoos.com may restart its vessel,
 * inspect it, or strengthen recovery, but ordinary shell may not erase the hand that can heal it.
 */

const MAIN_UNITS = Object.freeze(["awtsmoos", "awtsmoos.service"]);
const RECOVERY_UNITS = Object.freeze([
	"awtsmoos-health-watchdog",
	"awtsmoos-health-watchdog.timer",
	"awtsmoos-health-watchdog.service",
	"awtsmoos-recover",
	"awtsmoos-recover.service"
]);
const DANGEROUS_ACTIONS = new Set(["stop", "kill", "mask", "disable"]);
const INSPECTION_PREFIX = /^(?:sudo\s+)?(?:grep|rg|ripgrep|cat|head|tail|find|journalctl|sed\s+-n)\b/i;

/** Returns immutable policy evidence for one proposed shell command. */
function evaluateControlPlaneCommand(command) {
	const original = String(command || "");
	const normalized = normalize(original);
	if (!normalized || readOnlyInspection(normalized)) return allowed();
	const rules = [];
	for (const invocation of systemctlInvocations(normalized)) {
		const action = dangerousAction(invocation);
		if (!action) continue;
		const units = protectedUnits(invocation);
		if (units.some(unit => MAIN_UNITS.includes(unit))) {
			rules.push("main_service_shutdown");
		}
		if (units.some(unit => RECOVERY_UNITS.includes(unit))) {
			rules.push("recovery_path_shutdown");
		}
	}
	if (sysvMainStop(normalized)) rules.push("main_service_shutdown");
	if (namedProcessKill(normalized)) rules.push("main_process_kill");
	if (restartPolicyMutation(normalized)) rules.push("restart_policy_disabled");
	return verdict(rules);
}

function systemctlInvocations(command) {
	const matches = [];
	const pattern = /\bsystemctl\b\s+([^;&|\n]+)/gi;
	let match;
	while ((match = pattern.exec(command))) matches.push(match[1].trim());
	return matches;
}

function dangerousAction(invocation) {
	const tokens = invocation.replace(/["']/g, " ").split(/\s+/).filter(Boolean);
	return tokens.find(token => DANGEROUS_ACTIONS.has(token)) || null;
}

function protectedUnits(invocation) {
	const tokens = invocation.replace(/["']/g, " ").split(/\s+/).filter(Boolean);
	return tokens.map(token => token.replace(/[;,)]*$/, "")).filter(token => {
		return MAIN_UNITS.includes(token) || RECOVERY_UNITS.includes(token);
	});
}

function restartPolicyMutation(command) {
	if (!command.includes("/etc/systemd/system/awtsmoos.service.d/")) return false;
	if (!/restart\s*=\s*no/i.test(command)) return false;
	return /(?:>|\btee\b|\bprintf\b|\becho\b|\bsed\s+-i\b|\bperl\s+-pi\b|\binstall\b|\bcp\b|\bmv\b)/i.test(command);
}

function sysvMainStop(command) {
	return /\bservice\s+awtsmoos(?:\.service)?\s+(?:stop|kill|disable)\b/i.test(command);
}

function namedProcessKill(command) {
	return /\b(?:pkill|killall)\b[^;&|\n]{0,120}\bawtsmoos\b/i.test(command);
}

function readOnlyInspection(command) {
	return INSPECTION_PREFIX.test(command) && !/[;&|]\s*(?:sudo\s+)?systemctl\b/i.test(command);
}

function normalize(command) {
	return command.toLowerCase().replace(/\\\r?\n/g, " ").replace(/\s+/g, " ").trim();
}

function verdict(rules) {
	const unique = Object.freeze([...new Set(rules)]);
	return Object.freeze({
		allowed: unique.length === 0,
		rules: unique,
		safeAlternative: unique.length ? "systemctl restart awtsmoos.service" : null
	});
}

function allowed() {
	return verdict([]);
}

module.exports = {
	evaluateControlPlaneCommand
};
