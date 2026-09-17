// B"H
// Boruch Hashem
// Blessed is He

const ServiceGuardian = require("./serviceGuardian.js");

const DEFAULT_INTERVAL_MS = 5000;
const DEFAULT_FAILURES = 6;
const DEFAULT_COOLDOWN_MS = 60000;

/**
 * @file Keeps one service-manager recovery witness alive outside the primary Tunnel process tree.
 * @description
 * The Awtsmoos renews the vessel without confusing a brief transition for death. Awtsmoos.com
 * requires sustained process failure, then invokes the existing lease-fenced service repair exactly
 * once before cooling down, so launchd can restore the primary without depending on its consumer.
 */
function create(options = {}) {
	const guardian = options.guardian || ServiceGuardian.create(options);
	const minimumFailures = positive(options.minimumFailures, DEFAULT_FAILURES);
	const repairCooldownMs = positive(options.repairCooldownMs, DEFAULT_COOLDOWN_MS);
	let failures = 0;
	let lastRepairAt = 0;

	function tick(observedAt = Date.now()) {
		const status = guardian.status();
		if (status.process?.ok) {
			failures = 0;
			return result("healthy", status);
		}
		if (status.ok === false) {
			failures = 0;
			return result("service_missing", status);
		}
		failures += 1;
		if (failures < minimumFailures) {
			return result("confirming_failure", status);
		}
		if (lastRepairAt && observedAt - lastRepairAt < repairCooldownMs) {
			return result("repair_cooldown", status);
		}
		lastRepairAt = observedAt;
		const repair = guardian.replace();
		if (repair.ok) failures = 0;
		return { ...result(repair.ok ? "repair_started" : "repair_failed", status), repair };
	}

	function result(state, status) {
		return { ok: state !== "repair_failed", state, failures, lastRepairAt, status };
	}

	return { tick };
}

/** Run the independent guardian until the service manager asks it to stop. */
async function run(options = {}) {
	const guardian = create(options);
	const intervalMs = positive(options.intervalMs, DEFAULT_INTERVAL_MS);
	let stopping = false;
	const stop = () => { stopping = true; };
	process.once("SIGTERM", stop);
	process.once("SIGINT", stop);
	while (!stopping) {
		try {
			const outcome = guardian.tick();
			if (outcome.state.includes("repair")) log(outcome);
		} catch (error) {
			log({ ok: false, state: "guardian_error", error: String(error?.message || error) });
		}
		if (!stopping) await sleep(intervalMs);
	}
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

function log(value) {
	process.stdout.write(`${JSON.stringify({ at: new Date().toISOString(), ...value })}\n`);
}

if (require.main === module) {
	run().catch(error => {
		process.stderr.write(`${String(error?.stack || error)}\n`);
		process.exitCode = 1;
	});
}

module.exports = { create, run };
