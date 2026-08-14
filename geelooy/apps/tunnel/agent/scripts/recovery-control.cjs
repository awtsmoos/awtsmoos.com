#!/usr/bin/env node
// B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");
const Controller = require("../recovery/controller.js");
const Integrity = require("../recovery/integrity.js");
const State = require("../recovery/stateStore.js");

/** One narrow command mouth for durable startup, identity, and recovery truth. */
const [action = "status", rawRoot = process.cwd(), ...args] = process.argv.slice(2);
const root = path.resolve(rawRoot);
const result = execute(action, root, args);

if (args.includes("--shell") || process.argv.includes("--shell")) printShell(result);
else console.log(JSON.stringify(result, null, 2));

if (result.ok === false && !["before-start", "status"].includes(action)) {
	process.exitCode = 1;
}

function execute(selectedAction, runtimeRoot, selectedArgs) {
	switch (selectedAction) {
		case "seal":
			return Integrity.seal(runtimeRoot);
		case "check":
			return Integrity.check(runtimeRoot);
		case "before-start":
			return Controller.beforeStart(runtimeRoot);
		case "after-exit":
			return Controller.afterExit(runtimeRoot, selectedArgs[0], selectedArgs[1]);
		case "report-failure":
			return Controller.reportFailure(
				runtimeRoot,
				selectedArgs[0] || "reported_failure",
				selectedArgs[1] === "restore"
			);
		case "report-registration-failure":
			return Controller.reportRegistrationFailure(
				runtimeRoot,
				selectedArgs[0] || "registration_failure"
			);
		case "repair-identity":
			return Controller.repairIdentity(
				runtimeRoot,
				selectedArgs[0] || "identity_inspection",
				selectedArgs[1] === "reset"
			);
		case "set-tier":
			return Controller.setTier(runtimeRoot, selectedArgs[0]);
		case "mark-restored":
			return Controller.markRestored(runtimeRoot, {
				version: selectedArgs[0] || "",
				candidate: selectedArgs[1] || ""
			});
		case "mark-healthy":
			return Controller.markHealthy(runtimeRoot, {
				version: selectedArgs[0] || "",
				pid: selectedArgs[1] || ""
			});
		case "status":
			return {
				ok: true,
				state: State.read(runtimeRoot),
				health: Integrity.check(runtimeRoot)
			};
		default:
			return {
				ok: false,
				error: "unknown_recovery_action",
				action: selectedAction
			};
	}
}

function printShell(value = {}) {
	const environment = value.environment || {};
	for (const [key, entry] of Object.entries(environment)) {
		console.log(`${key}=${quote(entry)}`);
	}
	const state = value.state || {};
	console.log(`AWTSMOOS_RECOVERY_TIER=${quote(value.tier ?? state.tier ?? 5)}`);
	console.log(`AWTSMOOS_RECOVERY_RESTORE=${quote(value.restoreRequired ? 1 : 0)}`);
	console.log(`AWTSMOOS_RECOVERY_REASON=${quote(value.restoreReason || "")}`);
	console.log(`AWTSMOOS_IDENTITY_INSPECT=${quote(state.identityInspectionRequired ? 1 : 0)}`);
	console.log(`AWTSMOOS_IDENTITY_RESET=${quote(state.identityResetRequired ? 1 : 0)}`);
}

function quote(value) {
	return `'${String(value).replace(/'/g, "'\\''")}'`;
}
