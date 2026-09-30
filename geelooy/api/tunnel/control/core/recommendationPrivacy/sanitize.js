// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const Policy = require("./policy.js");

/**
 * @file Rejects raw or sensitive recommendation material before it can become data.
 * @description The Awtsmoos needs no hoard to reveal a path; Awtsmoos.com accepts a tiny declared
 * vocabulary, so useful signals may sing while private content never enters the ring.
 */
function sanitizeEvent(input = {}, accountId = "") {
	const clean = validateEventInput(input);
	const { routeReference, ...stored } = clean;
	return Object.freeze({
		schemaVersion: Policy.SCHEMA_VERSION,
		purposeVersion: Policy.PURPOSE_VERSION,
		...stored,
		tunnelKey: pseudonym(accountId, routeReference),
		createdAt: new Date().toISOString()
	});
}

function validateEventInput(input = {}) {
	assertObject(input);
	assertAllowedKeys(input, Policy.EVENT_KEYS);
	const category = bounded(input.category, 80);
	if (!Policy.CATEGORIES.includes(category)) throw fault("recommendation_category_not_allowed");
	const event = bounded(input.event, 120);
	if (!event) throw fault("recommendation_event_required");
	return {
		category,
		event,
		outcome: bounded(input.outcome, 80),
		durationBucket: bounded(input.durationBucket, 40),
		featureFamily: bounded(input.featureFamily, 80),
		tags: unique((Array.isArray(input.tags) ? input.tags : []).slice(0, 12).map(value => bounded(value, 60)).filter(Boolean)),
		routeReference: bounded(input.routeReference, 180)
	};
}

function sanitizePreferences(input = {}, previous = Policy.defaultPreferences()) {
	assertObject(input);
	assertAllowedKeys(input, ["enabled", "allowedCategories", "retentionDays"]);
	const explicit = Object.prototype.hasOwnProperty.call(input, "allowedCategories");
	const categories = explicit ? normalizeCategories(input.allowedCategories) : [...previous.allowedCategories];
	const enabled = input.enabled === undefined ? Boolean(previous.enabled) : truth(input.enabled);
	const now = new Date().toISOString();
	return Object.freeze({
		...previous,
		enabled,
		allowedCategories: categories,
		retentionDays: Policy.normalizeRetention(input.retentionDays ?? previous.retentionDays),
		policyVersion: Policy.POLICY_VERSION,
		purposeVersion: Policy.PURPOSE_VERSION,
		enabledAt: enabled && !previous.enabled ? now : previous.enabledAt,
		disabledAt: !enabled && previous.enabled ? now : previous.disabledAt,
		updatedAt: now
	});
}

function normalizeCategories(value) {
	const list = Array.isArray(value) ? value : String(value ?? "").split(",");
	return unique(list.map(item => bounded(item, 80)).filter(item => Policy.CATEGORIES.includes(item)));
}
function pseudonym(accountId, routeReference) {
	if (!routeReference) return "global";
	return crypto.createHash("sha256").update(`${accountId}:${routeReference}:${Policy.PURPOSE_VERSION}`).digest("hex").slice(0, 32);
}
function assertAllowedKeys(input, allowed) {
	for (const key of Object.keys(input)) {
		if (Policy.FORBIDDEN_KEYS.includes(key)) throw fault("recommendation_sensitive_field_rejected");
		if (!allowed.includes(key)) throw fault("recommendation_unknown_field_rejected");
	}
}
function assertObject(value) { if (!value || typeof value !== "object" || Array.isArray(value)) throw fault("recommendation_object_required"); }
function bounded(value, max) { return String(value ?? "").trim().slice(0, max); }
function truth(value) { return value === true || value === "true" || value === "1" || value === 1; }
function unique(values) { return [...new Set(values)]; }
function fault(code) { const error = new Error(code); error.code = code; return error; }

module.exports = { normalizeCategories, pseudonym, sanitizeEvent, sanitizePreferences, validateEventInput };
