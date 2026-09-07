// B"H
// Boruch Hashem
// Blessed is He

const Live = require("../../core/clientLiveness.js");

/**
 * @file Orders registration contenders without letting a weak fallback seize a healthy route.
 * @description
 * The Awtsmoos renews incumbent and contender beneath one authenticated registry key;
 * Awtsmoos.com grants split-equivalent authority only to an explicitly recovery-only emergency takeover.
 */
function protocolGeneration(value) {
	const text = String(value || "").trim().toLowerCase();
	const match = text.match(/(?:^|[-_])v(\d+)(?:$|[-_])/);
	if (match) return boundedGeneration(match[1]);
	if (/^\d+$/.test(text)) return boundedGeneration(text);
	return 0;
}

function boundedGeneration(value) {
	const generation = Number(value);
	return Number.isFinite(generation)
		? Math.max(0, Math.min(1000, Math.floor(generation)))
		: 0;
}

function recoveryTakeover(value = {}) {
	return String(value.registrationMode || "") === "emergency-takeover" &&
		value.capabilities?.recoveryOnlyV1 === true &&
		value.capabilities?.recoveryControlV1 === true;
}

function clientAuthority(value = {}) {
	const version = String(value.agentVersion || "").trim().toLowerCase();
	if (/^split-agent(?:-|$)/.test(version)) return 30;
	if (recoveryTakeover(value)) return 30;
	if (value.browserAgent === true || value.vesselType === "browser-tunnel") return 20;
	if (version && version !== "unknown" && version !== "native-local") return 10;
	return 0;
}

function authority(value = {}) {
	return {
		generation: protocolGeneration(value.protocolVersion),
		client: clientAuthority(value)
	};
}

function compare(left, right) {
	if (left.generation !== right.generation) return left.generation - right.generation;
	return left.client - right.client;
}

function ownerIsHealthy(owner, now = Date.now()) {
	return Boolean(owner) && Live.livenessSnapshot(owner, now).isAlive === true;
}

function decide(previous, contender = {}, now = Date.now()) {
	const incoming = authority(contender);
	const incumbent = authority(previous || {});
	const incumbentHealthy = ownerIsHealthy(previous, now);
	const details = {
		incomingAuthority: incoming,
		incumbentAuthority: incumbent,
		incomingGeneration: incoming.generation,
		incumbentGeneration: incumbent.generation,
		incumbentHealthy
	};
	if (!previous) return decision("accept", "unowned", details);
	if (previous === contender.client) return decision("accept", "same_socket", details);
	if (incumbentHealthy && compare(incumbent, incoming) > 0) {
		return decision("fence", "healthy_higher_authority_owner", details);
	}
	return decision(
		"replace",
		incumbentHealthy ? "equal_or_higher_authority_contender" : "incumbent_stale",
		details
	);
}

function decision(action, reason, details) {
	return Object.freeze({ action, reason, ...details });
}

module.exports = {
	authority,
	clientAuthority,
	compare,
	decide,
	ownerIsHealthy,
	protocolGeneration,
	recoveryTakeover
};
