// B"H
// Boruch Hashem
// Blessed is He

const RegistrationHealth = require("./registrationHealth.js");
const ServiceGuardian = require("./serviceGuardian.js");

const DEFAULT_INTERVAL_MS = 5000;
const DEFAULT_FAILURES = 6;
const DEFAULT_COOLDOWN_MS = 60000;
const DEFAULT_STALE_RECOVERY_GRACE_MS = 180000;

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
		if (processHealthy && registrationIsStarting(registration)) {
			failures = 0;
			return result("registration_starting", status, registration, "none");
		}
		// A stale receipt can coexist with a live launcher actively replacing its
		// connection child. The child recovery has a separate 45s registration
		// deadline and bounded retries; do not SIGTERM the entire launcher midway.
		if (processHealthy && registrationRecoveryGrace(registration, options)) {
			failures = 0;
			return result("registration_recovery_grace", status, registration, "none");
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

/** A live child gets time to create/advance its registration receipt without being replaced. */
function registrationIsStarting(registration) {
	if (!registration || registration.ok) return false;
	if (registration.reason === "receipt_missing") return true;
	if (registration.reason !== "not_registered") return false;
	if (registration.state === "registration_pending") return true;
	// A live agent reconnecting to a restarting server must not be killed by its
	// own recovery guardian. Only a genuinely stale reconnect may be replaced.
	return ["connecting", "reconnecting", "registering"].includes(registration.state)
		&& registration.freshnessKnown === true
		&& registration.ageMs <= Math.max(120000, registration.staleMs * 2);
}

/** Gives a living launcher time to complete its bounded child-level recovery. */
function registrationRecoveryGrace(registration, options = {}) {
	if (registration?.reason !== "registration_stale" || registration.freshnessKnown !== true) return false;
	const ageMs = Number(registration.ageMs);
	if (!Number.isFinite(ageMs) || ageMs < 0) return false;
	const staleMs = Number(registration.staleMs || 0);
	const graceMs = Math.max(
		positive(options.registrationRecoveryGraceMs, DEFAULT_STALE_RECOVERY_GRACE_MS),
		Number.isFinite(staleMs) ? staleMs * 3 : 0
	);
	return ageMs <= graceMs;
}

/** Run the independent guardian until its service manager asks it to stop. */
async function run(options = {}) {
	const guardian = create(options);
	const intervalMs = positive(options.intervalMs, DEFAULT_INTERVAL_MS);
	let stopping = false;
	const stop = () => { stopping = true; };
	process.once("SIGTERM", stop);
	process.once("SIGINT", stop);
	installLogFailureGuard(process.stdout);
	installLogFailureGuard(process.stderr);
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

let loggingAvailable = true;

/**
 * Prevents a full/failed log destination from killing the recovery guardian.
 * Healing is more important than telemetry; once a stream fails, logging becomes
 * best-effort silence until the guardian is restarted with a healthy destination.
 */
function installLogFailureGuard(stream) {
	if (!stream || typeof stream.on !== "function") return;
	stream.on("error", () => {
		loggingAvailable = false;
	});
}

function log(value, stream = process.stdout) {
	if (!loggingAvailable || !stream || typeof stream.write !== "function") return false;
	try {
		stream.write(`${JSON.stringify({ at: new Date().toISOString(), ...value })}\n`);
		return true;
	} catch {
		loggingAvailable = false;
		return false;
	}
}

if (require.main === module) {
	run().catch(error => {
		log({ ok: false, state: "guardian_fatal", error: String(error?.stack || error) }, process.stderr);
		process.exitCode = 1;
	});
}

module.exports = { create, run, log, installLogFailureGuard, registrationRecoveryGrace };
