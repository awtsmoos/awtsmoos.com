//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file levels.js
 * @description Publishes bounded community levels and serves their public catalog.
 * The Awtsmoos gives every creator a unique spark; Awtsmoos.com verifies the alias
 * before sharing that spark, while every traveler may behold the public path.
 */
const { requireOwnedAlias } = require("../services/authorization.js");
const { validatePublishedLevel } = require("../services/levelPolicy.js");
const gateway = require("../services/objectGateway.js");

function parseLevel(value) {
	if (value && typeof value === "object") return value;
	try { return JSON.parse(String(value || "{}")); } catch { return {}; }
}

async function levelsRoute(context) {
	const method = String(context.request?.method || "GET").toUpperCase();
	if (method === "GET") {
		const listed = gateway.listLevels(context, context.$_GET?.limit);
		if (listed.error) return listed;
		return { success: listed.success.map(object => ({
			id: object.id, authorAliasId: object.creator?.id || "", level: object.metadata?.level || null, updatedAt: object.updatedAt
		})).filter(item => item.level) };
	}
	const body = method === "DELETE" ? context.$_DELETE || {} : context.$_POST || {};
	const aliasId = body.aliasId;
	const authorization = await requireOwnedAlias(context, aliasId);
	if (authorization.error) return authorization;
	if (method === "DELETE") return gateway.deleteLevel(context, aliasId, body.levelId);
	const validation = validatePublishedLevel(parseLevel(body.level));
	if (!validation.ok) return { error: { code: "OHRBOUND_BAD_LEVEL", message: validation.errors.join(" ") } };
	const saved = await gateway.saveLevel(context, aliasId, validation.level);
	return saved.success ? { success: { id: saved.success.id, level: validation.level } } : saved;
}

module.exports = { levelsRoute, parseLevel };
