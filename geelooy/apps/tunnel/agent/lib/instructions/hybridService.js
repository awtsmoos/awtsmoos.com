//B"H
//Boruch Hashem
//Blessed be He

const Local = require("./service.js");
const Project = require("./projectInstructionDiscovery.js");
const { broker } = require("./serverBroker.js");

/**
 * @file Merges immutable doctrine, verified server additions, and scoped repository instruction layers.
 * @description
 * The Awtsmoos keeps the safety floor while revealing the local covenant nearest each file;
 * Awtsmoos.com names provenance and hashes so agents understand which layer governs which scope.
 */
class HybridInstructionService {
	async catalog() {
		const local = Local.instructionService.catalog();
		return {
			...local,
			serverAvailable: Boolean(broker.socket?.opened && broker.index),
			serverInstructionIndex: broker.index
		};
	}

	async resolve(payload = {}) {
		const local = Local.instructionService.resolve(payload);
		const projectInstructionLayers = Project.discover(payload);
		const remote = await broker.resolve(payload);
		const summaries = remote
			? mergeSummaries(local.instructionSummaries, remote.headlines)
			: local.instructionSummaries;
		return {
			...local,
			serverAvailable: Boolean(remote),
			serverInstructionGeneration: remote?.generation || "",
			requiredInstructionIds: summaries.map(item => item.id),
			instructionSummaries: summaries,
			projectInstructionLayers,
			projectInstructionSummary: Project.summarize(projectInstructionLayers),
			mustFetchBeforeWrite: summaries.length > 0 || projectInstructionLayers.length > 0
		};
	}

	async get(payload = {}) {
		const ids = Local.normalizeIds(payload);
		const local = Local.instructionService.get(payload);
		const remote = await broker.get(ids);
		const instructions = mergeInstructions(local.instructions, remote?.instructions);
		const present = new Set(instructions.map(item => item.id));
		const missingInstructionIds = ids.filter(id => !present.has(id));
		return {
			...local,
			ok: missingInstructionIds.length === 0,
			serverAvailable: Boolean(remote),
			serverInstructionGeneration: remote?.generation || "",
			instructions,
			missingInstructionIds
		};
	}
}

function mergeSummaries(local = [], remote = []) {
	const byId = new Map();
	for (const item of local || []) byId.set(item.id, item);
	for (const item of remote || []) {
		if (!item?.id || byId.has(item.id)) continue;
		byId.set(item.id, { ...item, source: "server" });
	}
	return [...byId.values()].sort((a, b) => a.id.localeCompare(b.id));
}

function mergeInstructions(local = [], remote = []) {
	const byId = new Map();
	for (const item of local || []) byId.set(item.id, item);
	for (const item of remote || []) {
		if (!item?.id || byId.has(item.id)) continue;
		byId.set(item.id, { ...item, source: "server" });
	}
	return [...byId.values()].sort((a, b) => a.id.localeCompare(b.id));
}

module.exports = {
	HybridInstructionService,
	hybridInstructionService: new HybridInstructionService(),
	mergeInstructions,
	mergeSummaries
};
