//B"H
//Boruch Hashem
//Blessed be He

const { detectCounterRenderProgram } = require("./CompactModuleBinary.js");
const { encodeMode2App } = require("./Mode2AppBinary.js");
const { compileUnifiedApp, nativeScriptOf } = require("./UnifiedAppBinary.js");
const { parseCss } = require("./SourceCssIrCompiler.js");
const { parseHtmlNodes } = require("./SourceHtmlIrCompiler.js");
const { bundleModuleSource, collectLinked } = require("./SourceLinkedAssets.js");
const {
	constTextScriptOf,
	detectWebGlProgram,
	foldStaticModuleResult
} = require("./SourceScriptOptimizers.js");

/**
 * Compiles a source project into the transitional MAPP executable payload.
 * HTML and CSS understanding is delegated to the same from-scratch standards
 * tokenizers used by the browser runtime; this coordinator performs no regex
 * markup or stylesheet parsing and introduces no external compiler dependency.
 *
 * @param {{files?:object,entry?:string}} request Source project.
 * @returns {Promise<Buffer>} MAPP executable bytes.
 */
async function compileSourceFilesToApp(request = {}) {
	const files = request.files || {};
	const entry = request.entry || "/index.html";
	const html = sourceEntry(files, entry);
	const linked = collectLinked(html, files, entry);
	const web = {
		events: [],
		nodes: parseHtmlNodes(html),
		styles: parseCss(linked.css)
	};
	return compileUnifiedApp({
		scripts: linked.scripts,
		web
	});
}

/**
 * Compiles a source project into the Mode2 transitional executable payload.
 * Narrow static recognizers remain optimization lanes only; general scripts are
 * never delegated to a host JavaScript parser by this source compiler.
 *
 * @param {{files?:object,entry?:string}} request Source project.
 * @returns {Promise<Buffer>} Mode2 executable bytes.
 */
async function compileSourceFilesToMode2(request = {}) {
	const files = request.files || {};
	const entry = request.entry || "/index.html";
	const html = sourceEntry(files, entry);
	const linked = collectLinked(html, files, entry);
	const program = detectCounterRenderProgram(files) || firstOptimizedProgram(linked.scripts);
	return encodeMode2App({
		nodes: parseHtmlNodes(html),
		program,
		styles: parseCss(linked.css)
	});
}

/** Returns the canonical entry source from slash or legacy slashless maps. */
function sourceEntry(files, entry) {
	return files[entry] ?? files[String(entry).replace(/^\//, "")] ?? "";
}

/** Finds the first script that can be represented by an existing Mode2 primitive. */
function firstOptimizedProgram(scripts) {
	for (const script of scripts || []) {
		if (script.native) return script.native;
		const source = script.source || "";
		const program = detectWebGlProgram(source)
			|| nativeScriptOf(source)
			|| constTextScriptOf(source);
		if (program) return program;
	}
	return null;
}

module.exports = {
	bundleModuleSource,
	collectLinked,
	compileSourceFilesToApp,
	compileSourceFilesToMode2,
	detectWebGlProgram,
	foldStaticModuleResult,
	parseCss,
	parseHtmlNodes
};
