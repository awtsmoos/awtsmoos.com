//B"H
//Boruch Hashem
//Blessed be He

const { detectCounterRenderProgram, encodeCompactModuleProgram } = require("./CompactModuleBinary.js");
const { parseImports, stripExports } = require("./MerkavaVmFileExecutor.js");
const { collectHtmlAssets } = require("./SourceHtmlAssets.js");
const { resolveCssImports } = require("./SourceCssImports.js");
const { readSourceFile, resolveSourcePath } = require("./SourcePathResolver.js");

/**
 * Recursively flattens repository-owned ES module source in deterministic import
 * order. Import parsing and export stripping are implemented by Merkava itself.
 *
 * @param {string} source Current module source.
 * @param {string} file Current canonical module path.
 * @param {object} files Project source dictionary.
 * @param {Set<string>} seen Cycle guard.
 * @returns {string} Bundled executor source.
 */
function bundleModuleSource(source = "", file = "/inline.js", files = {}, seen = new Set()) {
	if (seen.has(file)) return "";
	seen.add(file);
	let prefix = "";
	for (const imported of parseImports(source, file)) {
		const dependency = readSourceFile(files, imported.resolved, file);
		prefix += `${bundleModuleSource(dependency, imported.resolved, files, seen)}\n`;
	}
	return prefix + stripExports(source).code;
}

/**
 * Collects linked CSS and scripts from tokenized entry HTML without host parsing.
 * @param {string} entryHtml Entry HTML source.
 * @param {object} files Project source dictionary.
 * @param {string} entry Entry path.
 * @returns {{css:string,scripts:Array<object>}} Compiler assets.
 */
function collectLinked(entryHtml = "", files = {}, entry = "/index.html") {
	const assets = collectHtmlAssets(entryHtml);
	const css = collectCss(assets, files, entry);
	const compactProgram = detectCounterRenderProgram(files);
	if (compactProgram) {
		return {
			css,
			scripts: [{
				binary: encodeCompactModuleProgram(compactProgram),
				name: "compact-module-program",
				source: ""
			}]
		};
	}
	return {
		css,
		scripts: collectScripts(assets.scripts, files, entry)
	};
}

/** Expands linked and inline styles in source order. */
function collectCss(assets, files, entry) {
	const css = [];
	for (const link of assets.links) {
		if (String(link.rel || "").toLowerCase() !== "stylesheet" || !link.href) continue;
		const key = resolveSourcePath(link.href, entry);
		css.push(resolveCssImports(readSourceFile(files, key, entry), files, key));
	}
	for (const source of assets.styles) {
		css.push(resolveCssImports(source, files, entry));
	}
	return css.join("\n");
}

/** Materializes and deduplicates script records after module bundling. */
function collectScripts(records, files, entry) {
	const output = [];
	const seen = new Set();
	for (const record of records) {
		const attributes = record.attributes;
		const name = attributes.src || "inline";
		const sourcePath = attributes.src ? resolveSourcePath(attributes.src, entry) : "/inline.js";
		const raw = attributes.src ? readSourceFile(files, sourcePath, entry) : record.source;
		const isModule = attributes.type === "module";
		const source = isModule ? bundleModuleSource(raw, sourcePath, files) : raw;
		const key = isModule ? source.split(/\s+/).filter(Boolean).join(" ") : `${name}:${source}`;
		if (seen.has(key)) continue;
		seen.add(key);
		output.push({ module: isModule, name, source });
	}
	return output;
}

module.exports = {
	bundleModuleSource,
	collectLinked
};
