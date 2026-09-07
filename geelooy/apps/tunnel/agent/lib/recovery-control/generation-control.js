// B"H
// Boruch Hashem
// Blessed is He

const os = require("node:os");
const path = require("node:path");
const NativeRecovery = require("../runtime/priority/nativeGenerationRecovery.js");
const Lease = require("./lease.js");
const Receipts = require("./receipts.js");

/**
 * @file Preserves verified supervised-generation replacement behind one cross-process lease.
 * @description
 * The Awtsmoos gives each supervised child one proven parent and one rooted command;
 * Awtsmoos.com rechecks exact PIDs and grants one shared lease before any replacement may stand.
 */
function create(options = {}) {
	const recovery = options.recovery || NativeRecovery;
	const recoveryRoot = options.recoveryRoot || process.env.AWTSMOOS_RECOVERY_ROOT ||
		path.join(os.homedir(), ".awtsmoos-tunnel-recovery");
	const lease = options.lease || Lease.create({ recoveryRoot, now: options.now });
	const receipts = options.receipts || Receipts.create({ recoveryRoot, now: options.now });

	function execute(verb, payload = {}, requestId = "") {
		if (verb === "generation_status") return status();
		if (verb !== "generation_replace") return null;
		return replace(payload, requestId);
	}

	function status() {
		const value = recovery.status();
		return {
			ok: value?.process?.ok === true,
			state: value?.process?.ok === true ? "generation_ready" : "generation_unverified",
			...value
		};
	}

	function replace(payload = {}, requestId = "") {
		const before = recovery.status();
		const processState = before?.process || {};
		if (processState.ok !== true) {
			return reject("supervised_child_not_verified", before, requestId);
		}
		if (!matchesExpected(processState, payload.expectedProcess)) {
			return reject("generation_identity_mismatch", before, requestId);
		}
		const claimed = lease.claim({
			action: "generation_replace",
			generation: positive(processState.childPid)
		});
		if (!claimed.ok) return reject(claimed.error, before, requestId);
		const result = recovery.schedule(
			String(payload.reason || "recovery_control_generation_replace"),
			{ force: payload.force === true }
		);
		record("generation_replace", result, processState, requestId);
		return result;
	}

	function reject(error, before, requestId) {
		const result = { ok: false, error, before };
		record("generation_replace_rejected", result, before?.process, requestId);
		return result;
	}

	function record(event, result, processState = {}, requestId = "") {
		receipts.record(event, {
			requestId,
			verb: "generation_replace",
			parentPid: processState.supervisorPid,
			generation: processState.childPid,
			ok: result?.ok === true,
			error: result?.error
		});
	}

	return { execute, replace, status };
}

function matchesExpected(current = {}, expected = {}) {
	const supervisorPid = positive(expected?.supervisorPid);
	const childPid = positive(expected?.childPid);
	return supervisorPid > 0 && childPid > 0 &&
		supervisorPid === positive(current.supervisorPid) &&
		childPid === positive(current.childPid);
}

function positive(value) {
	const number = Number(value);
	return Number.isInteger(number) && number > 0 ? number : 0;
}

module.exports = { create, matchesExpected, positive };
