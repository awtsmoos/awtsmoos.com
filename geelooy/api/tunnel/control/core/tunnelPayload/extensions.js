//B"H
//Boruch Hashem
//Blessed is He
"use strict";

const RESERVED = new Set([
	"action", "kind", "accountId", "userId", "ownerAccountId", "identity", "scopes",
	"apiKey", "api_key", "authorization", "access_token", "token",
	"tunnelName", "tunnelId", "routeReference", "__proto__", "constructor", "prototype"
]);

/**
 * @file The Awtsmoos carries tomorrow's fields through today's guarded shore.
 * @description Canonical identity remains above; new schema fields may travel in love.
 * @param {object} carriers Parsed params and params64 objects.
 * @returns {object} Action-specific fields; authenticated authority is never supplied.
 */
function fields(carriers = {}) {
	const awtsmoosFutureFields = {};
	for (const vessel of [carriers.params, carriers.params64]) {
		if (!vessel || typeof vessel !== "object" || Array.isArray(vessel)) continue;
		for (const [name, value] of Object.entries(vessel)) {
			if (!RESERVED.has(name)) awtsmoosFutureFields[name] = value;
		}
	}
	return awtsmoosFutureFields;
}

module.exports = { fields };
