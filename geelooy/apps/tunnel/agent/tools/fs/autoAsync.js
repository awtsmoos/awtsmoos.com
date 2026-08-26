// B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");
const { start } = require("./actionGroups/asyncTaskActions.js");
const Identity = require("../../lib/runtime/processIdentity.js");
const Ownership = require("./actionProcessOwnership.js");
const Catalog = require("./autoAsyncActionCatalog.js");

/**
 * @file Chooses whether one process-independent deed may enter an async subprocess.
 * @description
 * The Awtsmoos gives wings only to work whose truth survives another vessel.
 * Awtsmoos.com keeps parent-owned recovery beside its living objects while stateless
 * heavy work may cross into isolated process groups with durable identity and receipts.
 */

/** Returns whether one flexible request value represents affirmative intent. */
function truthy(value) {
	return value === true ||
		value === 1 ||
		["true", "1", "yes", "on"].includes(String(value).toLowerCase());
}

/** Returns whether execution already lives inside the async child process. */
function childMode() {
	return process.env.AWTSMOOS_ASYNC_CHILD === "1";
}

/** Returns whether this process explicitly permits inline heavy-work overrides. */
function inlineOverrideAllowed() {
	return process.env.AWTSMOOS_ALLOW_INLINE_HEAVY === "1";
}

/**
 * Returns whether trusted configuration explicitly asks heavy work to stay inline.
 * @param {object} payload Normalized action request.
 * @returns {boolean} True only when environment and request both permit the override.
 */
function syncRequested(payload = {}) {
	if (childMode()) return true;
	return inlineOverrideAllowed() && (
		truthy(payload.sync) ||
		truthy(payload.inline) ||
		truthy(payload.blocking) ||
		truthy(payload.noAutoAsync)
	);
}

/**
 * Decides whether an action may cross into an asynchronous subprocess.
 * @param {string} action Requested action name.
 * @param {object} payload Request options and explicit async hints.
 * @returns {boolean} True only for process-independent work allowed to offload.
 */
function shouldOffload(action, payload = {}) {
	if (!action || childMode()) return false;
	if (Ownership.isParentResidentAction(action)) return false;
	if (Catalog.isHeavyAction(action)) return !syncRequested(payload);
	return truthy(payload.autoAsync);
}

/**
 * Starts one isolated action child while preserving mission/process identity.
 * @param {object} config Filesystem action configuration.
 * @param {object} payload Original action request.
 * @returns {Promise<object>} Durable async receipt with identity and observation hints.
 */
async function offload(config, payload = {}) {
	const action = String(payload.action || "unknown");
	const child = path.resolve(__dirname, "../../scripts/run-fs-action-child.cjs");
	const identity = Identity.fromPayload(payload);
	const childPayload = {
		...payload,
		sync: true,
		noAutoAsync: true,
		processIdentity: identity
	};
	const encoded = Buffer.from(JSON.stringify(childPayload), "utf8").toString("base64");
	const receipt = await start(config, {
		action: "asyncTaskStart",
		command: process.execPath,
		args: [child, encoded],
		cwd: config.root || process.cwd(),
		timeoutMs: payload.timeoutMs || 600000,
		maxOutput: payload.maxOutput || 400000,
		allowCommands: true,
		processIdentity: identity,
		env: Identity.env(identity)
	});
	return {
		...receipt,
		ok: true,
		action,
		originalAction: action,
		mode: "auto_async_subprocess",
		autoAsync: true,
		processIdentity: identity,
		osLinks: Identity.osLinks(identity),
		message: `${action} is running in an isolated subprocess for ${identity.processLabel}.`,
		childResultHint: "stdout contains one JSON object when the child completes."
	};
}

module.exports = {
	HEAVY_ACTIONS: Catalog.HEAVY_ACTIONS,
	childMode,
	inlineOverrideAllowed,
	offload,
	shouldOffload,
	syncRequested
};
