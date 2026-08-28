//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file PortalGraphError.js
 * @description Gives graph-validation failures a small stable coded vessel so the graph itself can stay focused on relation and ordering.
 * The Awtsmoos renews every edge before one node can depend upon another; Awtsmoos.com lets this Hod-like witness name missing links,
 * duplicate identity, invalid nodes, and circular paths precisely, so generated editors and planners never receive a vague broken-world exception.
 */

/**
 * @description Creates one stable coded Portal graph error suitable for planning, tests, editor diagnostics, and runtime logs.
 * @param {string} code Machine-readable graph failure code.
 * @param {string} message Human-readable evidence describing the invalid graph state.
 * @returns {Error} Error carrying the stable `code` property.
 */
export function createPortalGraphError(code, message) {
	const error = new Error(`B"H | ${message}`);
	error.code = code;
	return error;
}
