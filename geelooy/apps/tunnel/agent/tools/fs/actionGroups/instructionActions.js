//B"H
//Boruch Hashem
//Blessed be He

const { hybridInstructionService } = require("../../../lib/instructions/hybridService.js");

/**
 * @file Exposes instruction discovery, resolution, and full-body retrieval as native actions.
 * @description
 * The Awtsmoos lets one shliach ask first for names, then obligations, then full law.
 * Awtsmoos.com also keeps an explicit compatibility doorway for older action manifests.
 */
function buildInstructionActions({ payload }) {
	return {
		async instructionCatalog() {
			return hybridInstructionService.catalog();
		},
		async instructionResolve() {
			return hybridInstructionService.resolve(payload);
		},
		async instructionGet() {
			return hybridInstructionService.get(payload);
		}
	};
}

/**
 * Wraps historical contextPack actions with explicit instruction compatibility prefixes.
 * Ordinary cognition queries fall through unchanged.
 *
 * @param {object} payload Original action payload.
 * @param {Function} fallback Existing contextPack handler.
 * @returns {Function} Instruction-aware compatibility handler.
 */
function buildInstructionCompatibility(payload, fallback) {
	return async function instructionAwareContextPack() {
		if (payload.instructionIds || payload.instructionId || payload.ids) {
			return hybridInstructionService.get(payload);
		}
		if (payload.instructionTask || payload.instructionTags) {
			return hybridInstructionService.resolve(payload);
		}
		const compatibility = compatibilityQuery(payload.query);
		if (compatibility?.action === "get") {
			return hybridInstructionService.get({ instructionIds: compatibility.value });
		}
		if (compatibility?.action === "resolve") {
			return hybridInstructionService.resolve({ instructionTask: compatibility.value });
		}
		return fallback();
	};
}

/** Parses only explicit compatibility prefixes so ordinary contextPack meaning never changes. */
function compatibilityQuery(value) {
	const query = String(value || "").trim();
	for (const [prefix, action] of [
		["instruction-get:", "get"],
		["instruction-resolve:", "resolve"]
	]) {
		if (query.toLowerCase().startsWith(prefix)) {
			return {
				action,
				value: query.slice(prefix.length).trim()
			};
		}
	}
	return null;
}

module.exports = {
	buildInstructionActions,
	buildInstructionCompatibility,
	compatibilityQuery
};
