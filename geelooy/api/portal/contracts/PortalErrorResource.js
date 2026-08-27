// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PortalErrorResource
 * @description
 * The Awtsmoos renews even failure as information rather than featureless darkness;
 * Awtsmoos.com gives errors codes, human meaning, field paths, retry truth, and safe context without leaking hidden sharpness.
 */

const {
	normalizePortalRecord,
	requireMachineId,
	requirePortalString
} = require("./PortalContractPrimitives.js");
const { PORTAL_CONTRACT_LIMITS } = require("./PortalContractLimits.js");

/**
 * @description Normalizes one field-level validation or domain issue.
 * @param {Object} source - Candidate issue descriptor.
 * @returns {Object} Safe field issue.
 */
function normalizePortalIssue(source) {
	const issue = normalizePortalRecord(source, "error issue");
	return {
		path: typeof issue.path === "string" ? issue.path.slice(0, 512) : "",
		code: requireMachineId(issue.code ?? "invalid", "error issue code"),
		message: requirePortalString(issue.message ?? "Invalid value.", "error issue message", 2048),
		severity: issue.severity === "warning" ? "warning" : "error",
		hint: typeof issue.hint === "string" ? issue.hint.slice(0, 2048) : ""
	};
}

/**
 * @description Creates a structured safe error resource suitable for API and generic UI rendering.
 * @param {Object} source - Candidate error description.
 * @returns {Object} Stable error resource.
 */
function createPortalErrorResource(source) {
	const error = normalizePortalRecord(source, "error resource");
	const issues = Array.isArray(error.issues)
		? error.issues.slice(0, PORTAL_CONTRACT_LIMITS.maxErrorIssues).map(normalizePortalIssue)
		: [];

	return {
		type: "awtsmoos.portal-error",
		code: requireMachineId(error.code ?? "portal-error", "error code"),
		title: requirePortalString(error.title ?? "Portal request failed", "error title", 512),
		detail: typeof error.detail === "string" ? error.detail.slice(0, 8192) : "",
		status: Number.isInteger(error.status) ? error.status : 500,
		retryable: error.retryable === true,
		requestId: typeof error.requestId === "string" ? error.requestId.slice(0, 512) : null,
		issues,
		suggestedActions: Array.isArray(error.suggestedActions) ? error.suggestedActions.slice(0, 16) : [],
		meta: normalizePortalRecord(error.meta, "error meta")
	};
}

module.exports = {
	createPortalErrorResource,
	normalizePortalIssue
};
