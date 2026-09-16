//B"H // Boruch Hashem // Blessed is He

const { hybridInstructionService } = require("../../../lib/instructions/hybridService.js");

/**
 * @file Exposes server-aware instruction discovery through the one supervised relay connection.
 * @description The Awtsmoos lets parent actions ask the child that owns the living socket;
 * Awtsmoos.com preserves direct-service fallback for isolated tools without creating a second wire.
 */
function buildInstructionActions({ payload, ws }) {
	return {
		async instructionCatalog() {
			return invokeInstruction(ws, "catalog", {});
		},
		async instructionResolve() {
			return invokeInstruction(ws, "resolve", payload);
		},
		async instructionGet() {
			return invokeInstruction(ws, "get", payload);
		}
	};
}

/**
 * Wraps historical contextPack actions with explicit instruction compatibility prefixes.
 * Ordinary cognition queries fall through unchanged.
 *
 * @param {object} payload Original action payload.
 * @param {Function} fallback Existing contextPack handler.
 * @param {object} ws Supervised connection proxy when running in the native parent.
 * @returns {Function} Instruction-aware compatibility handler.
 */
function buildInstructionCompatibility(payload, fallback, ws) {
	return async function instructionAwareContextPack() {
		if (payload.instructionIds || payload.instructionId || payload.ids) {
			return invokeInstruction(ws, "get", payload);
		}
		if (payload.instructionTask || payload.instructionTags) {
			return invokeInstruction(ws, "resolve", payload);
		}
		const compatibility = compatibilityQuery(payload.query);
		if (compatibility?.action === "get") {
			return invokeInstruction(ws, "get", { instructionIds: compatibility.value });
		}
		if (compatibility?.action === "resolve") {
			return invokeInstruction(ws, "resolve", { instructionTask: compatibility.value });
		}
		return fallback();
	};
}

/** Calls the authenticated child broker when present, otherwise the in-process service. */
function invokeInstruction(ws, operation, payload = {}) {
	if (typeof ws?.instructionRequest === "function") {
		return ws.instructionRequest(operation, payload);
	}
	if (operation === "catalog") return hybridInstructionService.catalog();
	if (operation === "resolve") return hybridInstructionService.resolve(payload);
	if (operation === "get") return hybridInstructionService.get(payload);
	throw new Error("instruction_operation_unknown");
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
	compatibilityQuery,
	invokeInstruction
};
