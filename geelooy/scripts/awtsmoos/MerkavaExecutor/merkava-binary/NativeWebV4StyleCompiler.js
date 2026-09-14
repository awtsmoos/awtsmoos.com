//B"H
//Boruch Hashem
//Blessed be He

const { VirtualCssEngine } = require("../merkava-browser/VirtualCssEngine.js");
const { createNativeStyleDom } = require("./NativeWebV4StyleDom.js");

/**
 * Lowers standards-selector/cascade results to handle-addressed native styles.
 * Native hosts receive computed property/value pairs and therefore never need
 * a second CSS parser, selector engine, or cascade implementation.
 * @param {Array<object>} nodes Handle-addressed native-web-v4 DOM records.
 * @param {string} cssText Combined linked and inline stylesheet source.
 * @param {{width?:number,height?:number}} viewport Compile-time viewport facts.
 * @returns {Array<{handle:number,property:string,value:string}>} Native styles.
 */
function compileNativeComputedStyles(nodes, cssText, viewport = {}) {
	const graph = createNativeStyleDom(nodes);
	const engine = new VirtualCssEngine({
		height: Number(viewport.height || 768),
		width: Number(viewport.width || 1024)
	});
	engine.parseStyleSheet(cssText || "");
	const output = [];
	for (const node of nodes) {
		const element = graph.elements.get(node.handle);
		appendComputedStyle(output, node.handle, engine.compute(element));
	}
	return output;
}

/** Appends deterministic non-empty computed declarations for one node handle. */
function appendComputedStyle(output, handle, computed) {
	const entries = Object.entries(computed || {})
		.filter(([, value]) => value != null && String(value) !== "")
		.sort(([left], [right]) => left.localeCompare(right));
	for (const [property, value] of entries) {
		output.push(Object.freeze({
			handle,
			property,
			value: String(value)
		}));
	}
}

module.exports = { compileNativeComputedStyles };
