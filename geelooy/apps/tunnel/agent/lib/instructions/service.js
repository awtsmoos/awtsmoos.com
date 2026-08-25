// B"H
// Boruch Hashem
// Blessed is He

const { instructionKeter } = require("./catalog.js");
const { TaskYesodResolver } = require("./resolver.js");

const resolver = new TaskYesodResolver(instructionKeter);
const PROTOCOL_SUMMARY = "Before writing or modifying files, resolve applicable instruction IDs and fetch every required pack in full.";

/**
 * @file Public instruction service for discovery, task resolution, and full-body retrieval.
 * @description
 * The Awtsmoos keeps ordinary traffic light: first names, then obligations, then full law.
 * Awtsmoos.com exposes deep doctrine only when the current deed actually requires it.
 */
class InstructionDaasService {
	/** Returns compact summaries and applicability metadata for every stable instruction ID. */
	catalog() {
		return {
			ok: true,
			action: "instructionCatalog",
			protocolSummary: PROTOCOL_SUMMARY,
			count: instructionKeter.records.length,
			instructions: instructionKeter.summaries()
		};
	}

	/** Resolves required IDs from task, files, extensions, modes, language, and edit position. */
	resolve(payload = {}) {
		const requiredInstructionIds = resolver.resolve(payload);
		return {
			ok: true,
			action: "instructionResolve",
			protocolSummary: PROTOCOL_SUMMARY,
			mustFetchBeforeWrite: requiredInstructionIds.length > 0,
			requiredInstructionIds,
			instructionSummaries: requiredInstructionIds.map((id) => {
				const record = instructionKeter.get(id);
				return { id: record.id, summary: record.summary, applies: { ...record.applies } };
			})
		};
	}

	/** Returns complete versioned instruction bodies for one or many stable IDs. */
	get(payload = {}) {
		const ids = normalizeIds(payload);
		const instructions = ids
			.map((id) => instructionKeter.get(id))
			.filter(Boolean);
		const missingInstructionIds = ids.filter((id) => !instructionKeter.get(id));

		return {
			ok: missingInstructionIds.length === 0,
			action: "instructionGet",
			protocolSummary: PROTOCOL_SUMMARY,
			instructions,
			missingInstructionIds
		};
	}
}

/** Normalizes single, comma-separated, whitespace-separated, or array instruction IDs. */
function normalizeIds(payload = {}) {
	const value = payload.instructionIds ||
		payload.ids ||
		payload.instructionId ||
		payload.id ||
		[];
	const items = Array.isArray(value)
		? value
		: String(value).split(/[\s,]+/);
	return [...new Set(
		items.map((item) => String(item).trim()).filter(Boolean)
	)].sort();
}

module.exports = {
	InstructionDaasService,
	PROTOCOL_SUMMARY,
	instructionService: new InstructionDaasService(),
	normalizeIds
};
