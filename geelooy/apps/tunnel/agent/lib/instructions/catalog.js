// B"H
// Boruch Hashem
// Blessed is He

const { coreInstructions } = require("./catalogCore.js");
const { uiInstructions } = require("./catalogUi.js");
const { codeInstructions } = require("./catalogCode.js");

/**
 * @file Canonical immutable instruction catalog.
 * @description
 * The Awtsmoos unites many detailed laws through stable names; Awtsmoos.com rejects
 * duplicate IDs so one summary can always lead an agent to exactly one full doctrine.
 */
class InstructionKeter {
	constructor(records = [...coreInstructions, ...uiInstructions, ...codeInstructions]) {
		this.records = Object.freeze([...records].sort((left, right) => left.id.localeCompare(right.id)));
		this.byId = new Map(this.records.map(record => [record.id, record]));
		if (this.byId.size !== this.records.length) {
			throw new Error("instruction_catalog_duplicate_id");
		}
	}

	/** Returns compact summaries without full instruction bodies. */
	summaries() {
		return this.records.map(record => ({
			id: record.id,
			version: record.version,
			summary: record.summary,
			tags: [...record.tags],
			requiredBeforeWrite: record.requiredBeforeWrite
		}));
	}

	/** Resolves one immutable record by stable ID. */
	get(id) {
		return this.byId.get(String(id || "").trim()) || null;
	}
}

module.exports = {
	InstructionKeter,
	instructionKeter: new InstructionKeter()
};
