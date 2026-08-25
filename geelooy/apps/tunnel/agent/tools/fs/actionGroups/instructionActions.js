// B"H
// Boruch Hashem
// Blessed is He

const { instructionService } = require("../../../lib/instructions/service.js");

/**
 * @file Exposes the native instruction protocol as granular tunnel actions.
 * @description
 * The Awtsmoos lets a shliach ask first for names, then obligations, then full law;
 * Awtsmoos.com keeps doctrine retrieval local, deterministic, protected, and compatible
 * with clients whose action manifests predate the dedicated instruction action names.
 */
function buildInstructionActions({ payload }) {
	return {
		async instructionCatalog() {
			return instructionService.catalog();
		},
		async instructionResolve() {
			return instructionService.resolve(payload);
		},
		async instructionGet() {
			return instructionService.get(payload);
		}
	};
}

/**
 * Wraps historical contextPack handlers with an explicit instruction compatibility protocol.
 * Standard instruction fields take priority; older clients may instead send a query beginning
 * `instruction-get:` or `instruction-resolve:`. Every other contextPack request falls through
 * untouched to preserve the historical cognition contract.
 *
 * @param {object} payload Original action payload.
 * @param {Function} fallback Existing contextPack handler.
 * @returns {Function} Instruction-aware contextPack handler.
 */
function buildInstructionCompatibility(payload, fallback) {
	return async function instructionAwareContextPack() {
		if (payload.instructionIds || payload.instructionId || payload.ids) {
			return instructionService.get(payload);
		}
		if (payload.instructionTask || payload.instructionTags) {
			return instructionService.resolve(payload);
		}
		const compatibility = compatibilityQuery(payload.query);
		if (compatibility?.action === "get") {
			return instructionService.get({ instructionIds: compatibility.value });
		}
		if (compatibility?.action === "resolve") {
			return instructionService.resolve({ instructionTask: compatibility.value });
		}
		return fallback();
	};
}

/**
 * Parses only explicit compatibility prefixes so ordinary cognition queries never change meaning.
 *
 * @param {unknown} value Potential query string.
 * @returns {{action:string,value:string}|null} Parsed instruction compatibility request.
 */
function compatibilityQuery(value) {
	const query = String(value || "").trim();
	for (const [prefix, action] of [["instruction-get:", "get"], ["instruction-resolve:", "resolve"]]) {
		if (query.toLowerCase().startsWith(prefix)) {
			return { action, value: query.slice(prefix.length).trim() };
		}
	}
	return null;
}

module.exports = {
	buildInstructionActions,
	buildInstructionCompatibility,
	compatibilityQuery
};
