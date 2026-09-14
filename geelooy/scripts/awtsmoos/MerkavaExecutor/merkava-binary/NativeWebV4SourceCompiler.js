//B"H
//Boruch Hashem
//Blessed be He

const { encodeNativeWebV4 } = require("./NativeWebV4Encoder.js");
const { compileNativeTextEvents } = require("./NativeWebV4EventCompiler.js");
const { compileNativeComputedStyles } = require("./NativeWebV4StyleCompiler.js");
const { compileHtmlHandleNodes } = require("./SourceHtmlHandleCompiler.js");
const { collectLinked } = require("./SourceLinkedAssets.js");

/**
 * Compiles source files into the self-contained native web v4 executable.
 * HTML/CSS parsing is delegated to executor-owned standards modules, while the
 * first event primitive is compiled by a bounded executor-owned source parser.
 * @param {{files?:object,entry?:string}} request Source project.
 * @returns {Promise<Buffer>} Native web v4 executable bytes.
 */
async function compileSourceFilesToNativeWebV4(request = {}) {
	const files = request.files || {};
	const entry = request.entry || "/index.html";
	const html = sourceEntry(files, entry);
	const nodes = compileHtmlHandleNodes(html);
	const linked = collectLinked(html, files, entry);
	const styles = compileNativeComputedStyles(nodes, linked.css);
	const events = compileNativeTextEvents(nodes);
	return encodeNativeWebV4({ events, nodes, styles });
}

function sourceEntry(files, entry) {
	return files[entry] ?? files[String(entry).replace(/^\//, "")] ?? "";
}

module.exports = { compileSourceFilesToNativeWebV4 };
