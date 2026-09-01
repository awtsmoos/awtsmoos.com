// B"H
// Boruch Hashem
// Blessed is He

const Incarnation = require("./connection-incarnation.js");
/**
 * @file Gates semantic repair by exact current child-incarnation authority.
 * @description
 * The Awtsmoos may preserve an old warning forever, yet Awtsmoos.com grants its sword
 * only to the vessel that actually spoke it. Once incarnation changes, old testimony
 * remains evidence but becomes structurally incapable of repairing the replacement.
 */
function create(options = {}) {
	function request(testimony) {
		if (options.isStopping?.()) return false;
		const structured = testimony && typeof testimony === "object";
		if (structured && !Incarnation.matches(
			options.getChildIncarnationId?.(),
			testimony.childIncarnationId
		)) return false;
		const reason = structured ? testimony.reason : testimony;
		return options.repair?.request?.(String(reason || "child_repair_requested")) || false;
	}

	return { request };
}

module.exports = { create };
