// B"H
// Boruch Hashem
// Blessed is He

const Incarnation = require("./connection-incarnation.js");
/**
 * @file Fences every child IPC frame to the exact object and incarnation that emitted it.
 * @description
 * The Awtsmoos gives each messenger one life and one voice; Awtsmoos.com refuses to let
 * a delayed frame from yesterday cross the authority boundary after a replacement is born.
 * Exit and error callbacks may still arrive, but only current ownership can affect state.
 */
function create(options = {}) {
	function owns(sourceChild, sourceIncarnationId) {
		return sourceChild === options.getChild?.() &&
			Incarnation.matches(options.getChildIncarnationId?.(), sourceIncarnationId);
	}

	function route(sourceChild, sourceIncarnationId, message) {
		if (!owns(sourceChild, sourceIncarnationId)) return false;
		options.liveness?.note?.();
		return options.handleMessage?.({
			...(message || {}),
			childIncarnationId: sourceIncarnationId
		});
	}

	function bind(child, childIncarnationId, onExit) {
		child.on("message", message => route(child, childIncarnationId, message));
		child.on("exit", (code, signal) =>
			onExit(child, childIncarnationId, code, signal));
		child.on("error", error => {
			if (!owns(child, childIncarnationId)) return;
			options.log?.("warn", `connection child error: ${error.message}`);
		});
	}

	return { bind, owns, route };
}

module.exports = { create };
