//B"H
//Boruch Hashem
//Blessed be He

const Local = require("./service.js");
const { broker } = require("./serverBroker.js");

/**
 * @file Merges immutable local instruction law with verified dynamic server additions.
 * @description
 * The Awtsmoos always retains its local safety floor. Awtsmoos.com may add current
 * server doctrine when the parent websocket answers, but network failure never blocks it.
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
		const remote = await broker.resolve(payload);
		if (!remote) return {
			...local,
			serverAvailable: false
		};
		const summaries = mergeSummaries(
			local.instructionSummaries,
			remote.headlines
		);
		return {
			...local,
			serverAvailable: true,
			serverInstructionGeneration: remote.generation,
			requiredInstructionIds: summaries.map(item => item.id),
			instructionSummaries: summaries,
			mustFetchBeforeWrite: summaries.length > 0
		};
	}

	async get(payload = {}) {
		const ids = Local.normalizeIds(payload);
		const local = Local.instructionService.get(payload);
		const remote = await broker.get(ids);
		const instructions = mergeInstructions(
			local.instructions,
			remote?.instructions
		);
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

/** Preserves local summary authority while adding unique verified server headlines. */
function mergeSummaries(local = [], remote = []) {
	const byId = new Map();
	for (const item of local || []) byId.set(item.id, item);
	for (const item of remote || []) {
		if (!item?.id || byId.has(item.id)) continue;
		byId.set(item.id, {
			...item,
			source: "server"
		});
	}
	return [...byId.values()].sort((a, b) => a.id.localeCompare(b.id));
}

/** Preserves immutable local bodies while adding server-only verified instruction IDs. */
function mergeInstructions(local = [], remote = []) {
	const byId = new Map();
	for (const item of local || []) byId.set(item.id, item);
	for (const item of remote || []) {
		if (!item?.id || byId.has(item.id)) continue;
		byId.set(item.id, {
			...item,
			source: "server"
		});
	}
	return [...byId.values()].sort((a, b) => a.id.localeCompare(b.id));
}

module.exports = {
	HybridInstructionService,
	hybridInstructionService: new HybridInstructionService(),
	mergeInstructions,
	mergeSummaries
};
