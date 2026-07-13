// B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");
const Controller = require("../recovery/controller.js");
const Integrity = require("../recovery/integrity.js");
const State = require("../recovery/stateStore.js");

/**
 * B"H
 * The command line is the narrow mouth of the recovery vessel. The Awtsmoos
 * lets Awtsmoos.com supervise, inspect, seal, downgrade, and restore without a
 * human editing hidden state during the moment of failure.
 */
const [action = "status", rawRoot = process.cwd(), ...args] = process.argv.slice(2);
const root = path.resolve(rawRoot);
let result;

switch (action) {
	case "seal":
		result = Integrity.seal(root);
		break;
	case "check":
		result = Integrity.check(root);
		break;
	case "before-start":
		result = Controller.beforeStart(root);
		break;
	case "after-exit":
		result = Controller.afterExit(root, args[0], args[1]);
		break;
	case "report-failure":
		result = Controller.reportFailure(root, args[0] || "reported_failure", args[1] === "restore");
		break;
	case "set-tier":
		result = Controller.setTier(root, args[0]);
		break;
	case "status":
		result = {
			ok: true,
			state: State.read(root),
			health: Integrity.check(root)
		};
		break;
	default:
		result = {
			ok: false,
			error: "unknown_recovery_action",
			action
		};
		process.exitCode = 2;
}

if (args.includes("--shell") || process.argv.includes("--shell")) {
	printShell(result);
} else {
	console.log(JSON.stringify(result, null, 2));
}

function printShell(value = {}) {
	const environment = value.environment || {};
	for (const [key, entry] of Object.entries(environment)) {
		console.log(`${key}=${quote(entry)}`);
	}
	console.log(`AWTSMOOS_RECOVERY_TIER=${quote(value.tier ?? value.state?.tier ?? 5)}`);
	console.log(`AWTSMOOS_RECOVERY_RESTORE=${quote(value.restoreRequired ? 1 : 0)}`);
}

function quote(value) {
	return `'${String(value).replace(/'/g, "'\\''")}'`;
}
