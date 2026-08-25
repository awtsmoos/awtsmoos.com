// B"H
// Boruch Hashem
// Blessed is He

const { instructionKeter } = require("./catalog.js");
const { TaskYesodResolver } = require("./resolver.js");

const resolver = new TaskYesodResolver(instructionKeter);
const PROTOCOL_SUMMARY = "Before writing or modifying files, resolve applicable instruction IDs and fetch every required pack in full.";

/**
 * @file Public instruction service used by native actions and compatibility bridges.
 * @description
 * The Awtsmoos keeps the common doorway small: catalog gives summaries, resolve gives
 * obligations, and get opens the full text only for IDs the shliach actually needs.
 */
class InstructionDaasService {
	/** Returns the compact catalog suitable for normal tunnel responses. */
	catalog() {
		return {
			ok: true,
			action: "instructionCatalog",
			protocolSummary: PROTOCOL_SUMMARY,
			instructions: instructionKeter.summaries()
		};
	}

	/** Resolves required instruction IDs before writing. */
	resolve(payload = {}) {
		const requiredInstructionIds = resolver.resolve(payload);
		return {
			ok: true,
			action: "instructionResolve",
			protocolSummary: PROTOCOL_SUMMARY,
			mustFetchBeforeWrite: requiredInstructionIds.length > 0,
			requiredInstructionIds,
			instructionSummaries: requiredInstructionIds.map(id => instructionKeter.get(id)).map(record => ({ id: record.id, summary: record.summary }))
		};
	}

	/** Fetches complete instruction bodies for one or many IDs. */
	get(payload = {}) {
		const ids = normalizeIds(payload);
		const instructions = ids.map(id => instructionKeter.get(id)).filter(Boolean);
		const missingInstructionIds = ids.filter(id => !instructionKeter.get(id));
		return {
			ok: missingInstructionIds.length === 0,
			action: "instructionGet",
			protocolSummary: PROTOCOL_SUMMARY,
			instructions,
			missingInstructionIds
		};
	}
}

function normalizeIds(payload = {}) {
	const value = payload.instructionIds || payload.ids || payload.instructionId || payload.id || [];
	const items = Array.isArray(value) ? value : String(value).split(/[\s,]+/);
	return [...new Set(items.map(item => String(item).trim()).filter(Boolean))].sort();
}

module.exports = {
	InstructionDaasService,
	PROTOCOL_SUMMARY,
	instructionService: new InstructionDaasService()
};
