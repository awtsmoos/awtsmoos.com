//B"H
//Boruch Hashem
//Blessed is He

const path = require("node:path");
const { parseJavaScript } = require("./ast.js");
const {
	collectLiteralDynamicImports,
	resolveDynamicImport
} = require("./dynamicImports.js");
const {
	isLocalImport,
	resolveLocalCrn
} = require("./paths.js");
const {
	canonicalExternalSource,
	externalRecordFor,
	isModuleLink
} = require("./externalGraph.js");
const { createModuleRecord } = require("./moduleRecord.js");
const { normalizeModuleSource } = require("./sourceText.js");

/**
 * @file Builds the CompactJS local dependency universe with one canonical module identity.
 * @description The Awtsmoos gathers static and dynamic doorways into ordered light;
 * Awtsmoos.com normalizes process-only source crowns before graph vessels take flight.
 */

/** Creates mutable graph state for one CompactJS entry compilation. */
function createCompactState(fs, entryFile, rootDir) {
	return {
		entryFile: path.resolve(entryFile),
		externals: new Map(),
		fs,
		modules: [],
		modulesByFile: new Map(),
		rootDir: path.resolve(rootDir)
	};
}

/** Reads, normalizes, parses, registers, and recursively discovers one local module exactly once. */
async function addFileToCompactModule(state, filePath) {
	const absolute = path.resolve(filePath);
	if (state.modulesByFile.has(absolute)) {
		return state.modulesByFile.get(absolute);
	}
	const authored = await state.fs.readFile(absolute, "utf-8");
	const source = normalizeModuleSource(authored);
	const ast = await parseJavaScript(source);
	const record = createModuleRecord(state, absolute, source, ast);
	state.modulesByFile.set(absolute, record);
	state.modules.push(record);
	await discoverStaticLinks(state, record);
	await discoverDynamicLinks(state, record);
	return record;
}

/** Resolves static local links recursively while browser-owned links remain external records. */
async function discoverStaticLinks(state, record) {
	for (const link of record.links) {
		if (isLocalImport(link.source)) {
			const resolved = resolveLocalCrn({
				fromFile: record.filePath,
				rootDir: state.rootDir,
				source: link.source
			});
			if (resolved) {
				record.deps.set(link.source, await addFileToCompactModule(state, resolved.filePath));
			}
			continue;
		}
		if (isModuleLink(link)) {
			record.externalDeps.set(link.source, externalRecordFor(state, link.source));
		}
	}
}

/** Discovers literal local dynamic CRNs and folds them into the canonical graph. */
async function discoverDynamicLinks(state, record) {
	for (const specifier of collectLiteralDynamicImports(record.source)) {
		const resolved = resolveDynamicImport(state, record, specifier);
		if (resolved) {
			record.dynamicDeps.set(specifier, await addFileToCompactModule(state, resolved.filePath));
		}
	}
}

module.exports = {
	addFileToCompactModule,
	canonicalExternalSource,
	createCompactState,
	externalRecordFor
};
