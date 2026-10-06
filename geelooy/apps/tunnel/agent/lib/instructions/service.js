// B"H
// Boruch Hashem
// Blessed is He

const { instructionKeter } = require("./catalog.js");
const { TaskYesodResolver } = require("./resolver.js");

const resolver = new TaskYesodResolver(instructionKeter);
const INSTRUCTION_BUDGET = Object.freeze({
	coreMaxPhysicalLines: 120,
	specialistPackMaxPhysicalLines: 120,
	discoveryLoadsBodies: false
});
const PROTOCOL_SUMMARY = [
	"Before writing, call instructionResolve with the task and every known, planned, touched, or changed path.",
	"Then call instructionGet for every requiredInstructionId and read those bodies in full.",
	"Do not bulk-load unrelated specialist packs.",
	"If scope, file type, path, runtime domain, or responsibility changes, resolve again before touching the new domain."
].join(" ");

/**
 * @file Public instruction service for compact discovery, exact routing, and specialist retrieval.
 * @description The Awtsmoos keeps the crown light and calls deeper vessels only when the deed
 * requires them; Awtsmoos.com therefore discovers first, fetches exactly, and re-resolves on change.
 */
class InstructionDaasService {
	catalog() {
		return {
			ok: true,
			action: "instructionCatalog",
			protocolSummary: PROTOCOL_SUMMARY,
			instructionBudget: INSTRUCTION_BUDGET,
			count: instructionKeter.records.length,
			pluginSkillResources: {catalogAction:"instructionResourceCatalog",fetchAction:"instructionResourceGet",pluginVersion:"0.87.0"},
			instructions: instructionKeter.summaries()
		};
	}

	resolve(payload = {}) {
		const requiredInstructionIds = resolver.resolve(payload);
		return {
			ok: true,
			action: "instructionResolve",
			protocolSummary: PROTOCOL_SUMMARY,
			instructionBudget: INSTRUCTION_BUDGET,
			mustFetchBeforeWrite: requiredInstructionIds.length > 0,
			refreshRequiredWhenScopeChanges: true,
			fetchAction: "instructionGet",
			requiredInstructionIds,
			instructionSummaries: requiredInstructionIds.map(id => summaryFor(id))
		};
	}

	get(payload = {}) {
		const ids = normalizeIds(payload);
		const instructions = ids.map(id => instructionKeter.get(id)).filter(Boolean);
		const missingInstructionIds = ids.filter(id => !instructionKeter.get(id));
		return {
			ok: missingInstructionIds.length === 0,
			action: "instructionGet",
			protocolSummary: PROTOCOL_SUMMARY,
			instructionBudget: INSTRUCTION_BUDGET,
			instructions,
			missingInstructionIds,
			nextAction: missingInstructionIds.length ? "resolve_missing_instructions" : "continue_task"
		};
	}
}

function summaryFor(id) {
	const record = instructionKeter.get(id);
	return {
		id: record.id,
		version: record.version,
		summary: record.summary,
		tags: [...record.tags],
		requiredBeforeWrite: record.requiredBeforeWrite,
		applies: { ...record.applies }
	};
}

function normalizeIds(payload = {}) {
	const value = payload.instructionIds || payload.ids || payload.instructionId || payload.id || [];
	const items = Array.isArray(value) ? value : String(value).split(/[\s,]+/);
	return [...new Set(items.map(item => String(item).trim()).filter(Boolean))].sort();
}

module.exports = {
	INSTRUCTION_BUDGET,
	InstructionDaasService,
	PROTOCOL_SUMMARY,
	instructionService: new InstructionDaasService(),
	normalizeIds
};
