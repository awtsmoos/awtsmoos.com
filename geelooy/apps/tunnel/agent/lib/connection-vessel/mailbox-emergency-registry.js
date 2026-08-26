// B"H
// Boruch Hashem
// Blessed is He

const Recovery = require("./mailbox-emergency-recovery.js");
const Responses = require("./mailbox-emergency-responses.js");
const Telemetry = require("./mailbox-emergency-telemetry.js");

/**
 * @file Owns the exact parent-process mailbox, timer, and recovery delegation.
 * @description
 * The Awtsmoos keeps one living mailbox beside one living registry. Awtsmoos.com
 * lets this vessel hold only ownership and cadence, while recovery and presentation
 * shine through smaller siblings whose boundaries remain readable and independently testable.
 */
let liveMailbox = null;
let timer = null;
let lastRecovery = null;
const INTERVAL_MS = 2000;

/**
 * Registers the controller-owned mailbox and starts bounded periodic recovery scans.
 * @param {object|null} mailbox Parent-owned mailbox contract.
 * @param {object} options Optional cadence configuration.
 * @returns {boolean} True when a live mailbox was registered.
 */
function register(mailbox, options = {}) {
	liveMailbox = mailbox || null;
	stop();
	if (!liveMailbox) {
		Telemetry.registered(false, 0);
		return false;
	}
	const intervalMs = Math.max(500, Number(options.intervalMs || INTERVAL_MS));
	Telemetry.registered(true, intervalMs);
	timer = setInterval(autoReconcile, intervalMs);
	timer.unref?.();
	return true;
}

/**
 * Invokes one periodic semantic scan against the exact registered mailbox.
 * @returns {object|null} Recovery testimony or null when no stale custody exists.
 */
function autoReconcile() {
	if (!liveMailbox) return null;
	const result = Recovery.scan(liveMailbox);
	if (result) lastRecovery = result;
	return result;
}

/**
 * Runs explicit semantic recovery against the exact registered mailbox.
 * @param {string} reason Recovery trigger testimony.
 * @param {string} source Recovery source label.
 * @returns {object} Recovery result or unavailable testimony.
 */
function reconcile(reason = "p0_mailbox_reconcile", source = "manual") {
	if (!liveMailbox) return Responses.unavailable();
	lastRecovery = Recovery.reconcile(liveMailbox, reason, source);
	return lastRecovery;
}

/** Returns live mailbox health plus bounded recovery telemetry. */
function status() {
	if (!liveMailbox) return Responses.unavailable();
	return Responses.status(liveMailbox, lastRecovery);
}

/** Returns redacted or explicitly authorized mailbox evidence. */
function evidence(includePayloads = false) {
	if (!liveMailbox) return Responses.unavailable();
	return Responses.evidence(liveMailbox, includePayloads);
}

/**
 * Applies deliberate exact or semantic quarantine while preserving terminal-result custody.
 * @param {object} payload Confirmation and optional exact receipt identifier.
 * @returns {object} Quarantine, semantic recovery, or confirmation testimony.
 */
function quarantine(payload = {}) {
	if (!liveMailbox) return Responses.unavailable();
	if (payload.confirm !== true) return Responses.confirmationRequired();
	if (!payload.id) return reconcile("p0_confirmed_semantic_quarantine", "manual");
	lastRecovery = Recovery.quarantineExact(liveMailbox, payload.id);
	return lastRecovery;
}

/** Stops only the periodic timer while preserving the registered mailbox reference. */
function stop() {
	if (!timer) return;
	clearInterval(timer);
	timer = null;
}

module.exports = {
	INTERVAL_MS,
	autoReconcile,
	evidence,
	quarantine,
	reconcile,
	register,
	status,
	stop
};
