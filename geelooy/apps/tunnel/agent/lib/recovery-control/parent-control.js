// B"H
// Boruch Hashem
// Blessed is He

const os = require("node:os");
const path = require("node:path");
const Lease = require("./lease.js");
const Receipts = require("./receipts.js");
const RepairContext = require("../connection-vessel/parent-watchdog-repair-context.js");
const RepairIdentity = require("../connection-vessel/parent-repair-identity.js");

/**
 * @file Executes only bounded exact-parent recovery deeds inside the connection child.
 * @description
 * The Awtsmoos renews a process beyond its recycled number; Awtsmoos.com first reveals
 * PID, generation, and birth, then rotates only that exact life beneath a shared recovery seal.
 */
function create(options = {}) {
	const recoveryRoot = options.recoveryRoot || process.env.AWTSMOOS_RECOVERY_ROOT ||
		path.join(os.homedir(), ".awtsmoos-tunnel-recovery");
	const parentPid = Number(options.parentPid || process.ppid || 0);
	const getGeneration = options.getGeneration || (() => 0);
	const context = options.repairContext || RepairContext.create({
		parentPid,
		getGeneration,
		observeProcess: options.observeProcess,
		compareProcess: options.compareProcess,
		signalParent: options.signalParent,
		setTimer: options.setTimer,
		clearTimer: options.clearTimer,
		recordLifecycle: options.recordLifecycle
	});
	const lease = options.lease || Lease.create({ recoveryRoot, now: options.now });
	const receipts = options.receipts || Receipts.create({ recoveryRoot, now: options.now });

	function execute(verb, payload = {}, requestId = "") {
		if (verb === "status") return status();
		if (verb !== "rotate_parent") return failure("recovery_control_verb_not_allowed");
		return rotate(payload, requestId);
	}

	function status() {
		return {
			ok: true,
			state: "recovery_control_ready",
			parentIdentity: context.identity.current(),
			repair: context.repair.snapshot()
		};
	}

	function rotate(payload, requestId) {
		const expected = RepairIdentity.normalize(payload.expectedIdentity);
		if (!expected || context.identity.matches(expected) !== true) {
			return recordFailure("recovery_control_identity_mismatch", expected, requestId);
		}
		const claimed = lease.claim({
			action: "rotate_parent",
			generation: expected.generation
		});
		if (!claimed.ok) return recordFailure(claimed.error, expected, requestId);
		const started = context.repair.request("recovery_control_rotate_parent", {
			allowed: true,
			identity: expected
		});
		const result = started
			? { ok: true, state: "parent_rotation_requested", generation: expected.generation }
			: failure("recovery_control_repair_rejected");
		receipts.record("rotate_parent", testimony(result, expected, requestId));
		return result;
	}

	function recordFailure(error, identity, requestId) {
		const result = failure(error);
		receipts.record("rotate_parent_rejected", testimony(result, identity, requestId));
		return result;
	}

	return { execute, status };
}

function testimony(result, identity = {}, requestId = "") {
	return {
		requestId,
		verb: "rotate_parent",
		parentPid: identity?.parentPid,
		generation: identity?.generation,
		ok: result.ok === true,
		error: result.error
	};
}

function failure(error) {
	return { ok: false, error: String(error || "recovery_control_failed") };
}

module.exports = { create, failure, testimony };
