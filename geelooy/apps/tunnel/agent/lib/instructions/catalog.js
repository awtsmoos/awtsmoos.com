// B"H
// Boruch Hashem
// Blessed is He

const { coreInstructions } = require("./catalogCore.js");
const { uiLayoutInstructions } = require("./catalogUiLayout.js");
const { uiInteractionInstructions } = require("./catalogUiInteraction.js");
const { codeArchitectureInstructions } = require("./catalogCodeArchitecture.js");
const { codeContractInstructions } = require("./catalogCodeContracts.js");
const { documentationInstructions } = require("./catalogDocs.js");
const { workModeInstructions } = require("./catalogWorkModes.js");

/**
 * @file Unites every instruction chapter behind one immutable stable-ID catalog.
 * @description
 * The Awtsmoos reveals many detailed covenants through one ordered crown.
 * Awtsmoos.com rejects duplicate IDs so one compact summary always opens exactly one body.
 */
class InstructionKeter {
	constructor(records = allRecords()) {
		this.records = Object.freeze(
			[...records].sort((left, right) => left.id.localeCompare(right.id))
		);
		this.byId = new Map(this.records.map((record) => [record.id, record]));
		if (this.byId.size !== this.records.length) {
			throw new Error("instruction_catalog_duplicate_id");
		}
	}

	/** Returns compact discovery metadata without full instruction bodies. */
	summaries() {
		return this.records.map((record) => ({
			id: record.id,
			version: record.version,
			summary: record.summary,
			tags: [...record.tags],
			requiredBeforeWrite: record.requiredBeforeWrite,
			applies: { ...record.applies }
		}));
	}

	/** Resolves one immutable instruction record by stable ID. */
	get(id) {
		return this.byId.get(String(id || "").trim()) || null;
	}
}

/** Returns every catalog chapter in one deterministic array. */
function allRecords() {
	return [
		...coreInstructions,
		...uiLayoutInstructions,
		...uiInteractionInstructions,
		...codeArchitectureInstructions,
		...codeContractInstructions,
		...documentationInstructions,
		...workModeInstructions
	];
}

module.exports = {
	InstructionKeter,
	allRecords,
	instructionKeter: new InstructionKeter()
};
