// B"H
// Boruch Hashem
// Blessed is He

const { createHash } = require("node:crypto");
const Instructions = require("./connectionInstructionCatalog.js");

/**
 * @file Projects one canonical runtime connection covenant into compact API testimony.
 * @description
 * The Awtsmoos is One while transport vessels change; Awtsmoos.com therefore trusts the
 * runtime's registered context when present and derives a legacy fallback only for older
 * agents, so API presentation cannot invent a rival generation or digest in the night.
 */
function connectionReceipt(result = {}) {
	const canonical = canonicalContext(result);
	const fallback = canonical?.connectionContextId
		? canonical
		: fallbackContext(result);
	return {
		connectionContextId: text(fallback.connectionContextId),
		connectionContextDigest: text(fallback.connectionContextDigest),
		connectionContract: objectOrEmpty(fallback.connectionContract),
		transportGeneration: numberOrNull(
			result.connection?.transportGeneration ?? result.connection?.generation
		),
		transportRevision: numberOrNull(
			result.connection?.transportRevision ?? result.connection?.generation
		),
		runtimeGenerationId: text(
			result.connection?.runtimeGenerationId || result.runtimeGenerationId
		),
		health: healthSummary(result),
		instructionCatalogDigest: Instructions.CATALOG_DIGEST,
		instructionKeys: Instructions.keysFor(result)
	};
}

function canonicalContext(result = {}) {
	const context = result.connection?.connectionContext;
	return context && typeof context === "object" ? context : null;
}

function fallbackContext(result = {}) {
	const contract = stableContract(result);
	const digest = sha256(JSON.stringify(contract));
	return {
		connectionContextId: `ctx_${digest.slice(0, 24)}`,
		connectionContextDigest: digest,
		connectionContract: contract
	};
}

function stableContract(result = {}) {
	return {
		tunnelName: text(result.tunnelName || result.connection?.tunnelName),
		agentVersion: text(result.agentVersion || result.connection?.agentVersion),
		releaseSourceSha: text(result.releaseSourceSha || result.connection?.releaseSourceSha),
		actionManifestHash: text(result.actionManifestHash || result.connection?.actionManifestHash),
		actionSchemaDigest: text(result.actionSchemaDigest || result.connection?.actionSchemaDigest),
		publicActionDigest: text(result.publicActionDigest || result.connection?.publicActionDigest),
		publicActionCount: numberOrNull(result.publicActionCount || result.connection?.publicActionCount) || 0,
		instructionCatalogDigest: Instructions.CATALOG_DIGEST
	};
}

function healthSummary(result = {}) {
	const connection = result.connection || {};
	const full = connection.fullHealth || {};
	const execution = connection.executionHealth || full.execution || {};
	const mailbox = full.mailbox || connection.mailbox?.health || {};
	const failure = connection.lastFailure || null;
	return {
		state: text(full.state || (full.healthy === false ? "degraded" : "healthy")),
		transportHealthy: full.transportHealthy !== false,
		executionHealthy: execution.healthy !== false,
		mailboxHealthy: mailbox.healthy !== false,
		repairing: Boolean(execution.repairing || connection.parent?.repairing),
		lastFailureCategory: text(failure?.category),
		lastFailureRetryable: failure?.retryable === true,
		lastFailureUpstreamLikely: failure?.upstreamLikely === true
	};
}

function sha256(value) {
	return createHash("sha256").update(String(value || "")).digest("hex");
}

function numberOrNull(value) {
	const number = Number(value);
	return Number.isFinite(number) ? number : null;
}

function objectOrEmpty(value) {
	return value && typeof value === "object" ? value : {};
}

function text(value) {
	return String(value || "");
}

module.exports = {
	canonicalContext,
	connectionReceipt,
	fallbackContext,
	healthSummary,
	stableContract
};
