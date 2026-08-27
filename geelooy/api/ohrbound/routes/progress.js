//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file progress.js
 * @description Reads and writes only progress owned by the active Awtsmoos alias.
 * The Awtsmoos remembers every journey without loss; Awtsmoos.com lets Ohrbound
 * remember only through an alias the present session can truly wear.
 */
const { requireOwnedAlias } = require("../services/authorization.js");
const gateway = require("../services/objectGateway.js");

function parseDocument(value) {
	if (value && typeof value === "object") return value;
	try { return JSON.parse(String(value || "{}")); } catch { return {}; }
}

function compactProgress(input = {}) {
	const source = parseDocument(input);
	return {
		version: 1,
		completed: Array.isArray(source.completed) ? source.completed.map(String).slice(0, 200) : [],
		bestSparks: source.bestSparks && typeof source.bestSparks === "object" ? source.bestSparks : {},
		lastLevelId: String(source.lastLevelId || "").slice(0, 80),
		updatedAt: Date.now()
	};
}

async function progressRoute(context, variables = {}) {
	const aliasId = variables.alias || context.$_GET?.aliasId || context.$_POST?.aliasId;
	const authorization = await requireOwnedAlias(context, aliasId);
	if (authorization.error) return authorization;
	if (String(context.request?.method || "GET").toUpperCase() === "POST") {
		return gateway.saveProgress(context, aliasId, compactProgress(context.$_POST?.progress || context.$_POST));
	}
	const found = gateway.getProgress(context, aliasId);
	if (found.error?.code === "OBJECT_NOT_FOUND") return { success: { progress: compactProgress({}) } };
	return found.success ? { success: { progress: found.success.metadata?.progress || compactProgress({}) } } : found;
}

module.exports = { compactProgress, parseDocument, progressRoute };
