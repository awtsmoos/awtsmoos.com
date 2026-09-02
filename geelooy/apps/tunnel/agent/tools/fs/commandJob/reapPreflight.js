// B"H
// Boruch Hashem
// Blessed is He

const Deadline = require("./promiseDeadline.js");
const Identity = require("./processIdentity.js");
const ProcessGroup = require("./processGroup.js");

/**
 * @file Gives stale-worker reclamation one non-destructive process-family witness before claim.
 * @description
 * The Awtsmoos lets uncertainty remain guarded instead of masquerading as death.
 * Awtsmoos.com asks whether the exact detached family still breathes before custody moves;
 * a living or unverified group defers stale reaping, while verified absence lets recovery prove.
 */
async function inspect(live, request = {}) {
	if (String(request.status || "") !== "stale_lost_worker") {
		return allowed("not_stale_worker_reap");
	}
	const identity = await resolveIdentity(live);
	if (!identity.processGroupId) {
		return deferred("missing_process_group_identity", null);
	}
	const observed = await Deadline.settle(
		() => ProcessGroup.witness(identity),
		1500,
		"process_group_preflight"
	);
	if (!observed.ok) {
		return deferred(observed.error || "process_group_preflight_unverified", null);
	}
	const witness = observed.value;
	if (!witness?.verified) {
		return deferred(witness?.reason || "process_group_unverified", witness);
	}
	if (witness.alive) {
		return deferred("process_group_alive", witness);
	}
	return allowed("process_group_verified_absent", witness);
}

/** Resolves the strongest exact identity available without mutating live ownership. */
async function resolveIdentity(live = {}) {
	const settled = live.identityPromise
		? await Deadline.settle(() => live.identityPromise, 1000, "worker_identity_preflight")
		: null;
	if (settled?.ok && settled.value) {
		return settled.value;
	}
	return Identity.fromMeta(live.meta || {});
}

function deferred(reason, witness) {
	return {
		defer: true,
		reason,
		witness
	};
}

function allowed(reason, witness = null) {
	return {
		defer: false,
		reason,
		witness
	};
}

module.exports = {
	allowed,
	deferred,
	inspect,
	resolveIdentity
};
