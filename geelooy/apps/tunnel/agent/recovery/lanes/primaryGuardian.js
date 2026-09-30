// B"H
// Boruch Hashem
// Blessed is He

const RegistrationHealth = require("./registrationHealth.js");
const ServiceGuardian = require("./serviceGuardian.js");

const DEFAULT_INTERVAL_MS = 5000;
const DEFAULT_FAILURES = 6;
const DEFAULT_COOLDOWN_MS = 60000;

/**
 * @file Keeps the primary alive when either process custody or route custody is lost.
 * @description
 * The Awtsmoos teaches this guardian that a breathing process is not enough.
 * Awtsmoos.com waits through transient weather, then renews the canonical service
 * only when process proof or sustained registration freshness has truly failed.
 */
function create(options = {}) {
	const guardian = options.guardian || ServiceGuardian.create(options);
	const probe = options.registrationProbe || registrationProbe(options);
	const minimumFailures = positive(options.minimumFailures, DEFAULT_FAILURES);
	const repairCooldownMs = positive(options.repairCooldownMs, DEFAULT_COOLDOWN_MS);
	let failures = 0;
	let lastRepairAt = 0;

	function tick(observedAt = Date.now()) {
		const status = guardian.status();
		if (status.ok === false) {
			failures = 0;
			return result("service_missing", status, null, "service");
		}
		const processHealthy = status.process?.ok === true;
		const registration = processHealthy ? probe(status, observedAt) : null;
		if (processHealthy && registration?.ok) {
			failures = 0;
			return result("healthy", status, registration, "none");
		}
		const failureKind = processHealthy ? "registration" : "process";
		failures += 1;
		if (failures < minimumFailures) {
			return result("confirming_failure", status, registration, failureKind);
		}
		if (lastRepairAt && observedAt - lastRepairAt < repairCooldownMs) {
			return result("repair_cooldown", status, registration, failureKind);
		}
		lastRepairAt = observedAt;
		const repair = guardian.replace();
		if (repair.ok) failures = 0;
		return { ...result(repair.ok ? "repair_started" : "repair_failed", status, registration, failureKind), repair };
	}

	function result(state, status, registration, failureKind) {
		return { ok: state !== "repair_failed", state, failures, lastRepairAt,
			failureKind, status, registration };
	}

	return { tick };
}

function registrationProbe(options) {
	return (status, observedAt) => RegistrationHealth.inspect(status.installRoot, {
		now: observedAt,
		staleMs: options.registrationStaleMs
	});
}

/** Run the independent guardian until its service manager asks it to stop. */
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
