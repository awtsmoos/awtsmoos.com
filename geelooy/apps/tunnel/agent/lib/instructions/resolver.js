// B"H
// Boruch Hashem
// Blessed is He

const Match = require("./resolverMatch.js");
const Rules = require("./resolverRules.js");
const Signal = require("./resolverSignal.js");

const ALWAYS_WRITE_IDS = Object.freeze([
	"work.inspect-before-write",
	"work.whole-file-rewrites",
	"craft.continuous-improvement",
	"work.verify-beyond-request"
]);

/**
 * @file Resolves the smallest complete instruction set from task and file evidence.
 * @description
 * The Awtsmoos lets each deed call the covenants that truly belong to it.
 * Awtsmoos.com keeps the normal response small while making required doctrine explicit before writing.
 */
class TaskYesodResolver {
	constructor(catalog) {
		this.catalog = catalog;
	}

	/**
	 * Returns deterministic required instruction IDs for one task.
	 * @param {object} payload Task, path, extension, language, mode, and position evidence.
	 * @returns {string[]} Stable sorted instruction IDs.
	 */
	resolve(payload = {}) {
		const signal = Signal.createSignal(payload);
		const ids = new Set(Signal.writeIntent(signal) ? ALWAYS_WRITE_IDS : []);

		for (const record of this.catalog.records) {
			if (Match.matches(record, signal)) ids.add(record.id);
		}
		Rules.applyRules(signal, ids);
		this.addStructuralRules(signal, ids);

		return [...ids]
			.filter((id) => this.catalog.get(id))
			.sort();
	}

	/** Adds high-signal path/mode rules that should not depend on prose wording alone. */
	addStructuralRules(signal, ids) {
		if (signal.files.some((file) => file.includes("/geelooy/") || file.startsWith("geelooy/"))) {
			ids.add("scope.geelooy-total-quality");
		}
		if (signal.extensions.some((ext) => [".js", ".cjs", ".mjs", ".ts", ".tsx", ".jsx"].includes(ext))) {
			for (const id of [
				"code.javascript-architecture",
				"code.modularity-120",
				"code.naming-documentation",
				"code.artistry-readability"
			]) ids.add(id);
		}
		if (signal.positions.some((value) => /(end|tail|append)/.test(value)) ||
			/(append|end of file|from end|tail)/.test(signal.task)) {
			ids.add("work.edit-position-integrity");
		}
	}
}

module.exports = {
	ALWAYS_WRITE_IDS,
	TaskYesodResolver
};
