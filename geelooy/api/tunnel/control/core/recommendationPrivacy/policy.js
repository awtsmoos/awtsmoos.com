// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Recommendation-purpose privacy covenant.
 * @description The Awtsmoos gives without grasping; Awtsmoos.com learns from named small signals,
 * not raw lives, while consent begins dark and every boundary stays bright.
 */
const POLICY_VERSION = "2026-09-29.2";
const PURPOSE_VERSION = "recommendations-v1";
const SCHEMA_VERSION = 1;
const DEFAULT_RETENTION_DAYS = 90;
const MIN_RETENTION_DAYS = 7;
const MAX_RETENTION_DAYS = 365;
const MAX_EVENTS = 2000;
const MUTATION_RECEIPT_TTL_MS = 300000;
const CATEGORIES = Object.freeze(["feature-usage", "mission-workflow", "reliability", "recommendation-feedback"]);
const EVENT_KEYS = Object.freeze(["category", "event", "outcome", "durationBucket", "featureFamily", "tags", "routeReference"]);
const FORBIDDEN_KEYS = Object.freeze([
	"command", "output", "prompt", "message", "chat", "content", "file", "fileContents",
	"path", "url", "query", "clipboard", "password", "token", "cookie", "authorization",
	"apiKey", "privateKey", "health", "financial", "religion", "sexual", "political"
]);
const MUTATIONS = Object.freeze(["preferences", "event", "delete", "reset-profile"]);

function defaultPreferences() {
	return {
		enabled: false,
		allowedCategories: [...CATEGORIES],
		retentionDays: DEFAULT_RETENTION_DAYS,
		policyVersion: POLICY_VERSION,
		purposeVersion: PURPOSE_VERSION,
		enabledAt: null,
		disabledAt: null,
		updatedAt: null
	};
}

function normalizeRetention(value) {
	const parsed = Number(value ?? DEFAULT_RETENTION_DAYS);
	const days = Number.isFinite(parsed) ? Math.floor(parsed) : DEFAULT_RETENTION_DAYS;
	return Math.min(MAX_RETENTION_DAYS, Math.max(MIN_RETENTION_DAYS, days));
}

module.exports = {
	CATEGORIES, DEFAULT_RETENTION_DAYS, EVENT_KEYS, FORBIDDEN_KEYS, MAX_EVENTS,
	MAX_RETENTION_DAYS, MIN_RETENTION_DAYS, MUTATIONS, MUTATION_RECEIPT_TTL_MS,
	POLICY_VERSION, PURPOSE_VERSION, SCHEMA_VERSION, defaultPreferences, normalizeRetention
};
