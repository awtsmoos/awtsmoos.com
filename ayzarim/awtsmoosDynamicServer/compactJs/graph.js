//B"H
//Boruch Hashem
//Blessed is He

const path = require("path");
const { parseJavaScript } = require("./ast.js");
const { collectLiteralDynamicImports, resolveDynamicImport } = require("./dynamicImports.js");
const { collectTopLevelExports, collectTopLevelModuleLinks } = require("./imports.js");
const {
	cleanImportSource,
	isLocalImport,
	isPublicExternalImport,
	resolveLocalCrn
} = require("./paths.js");

/**
 * @file Builds the CompactJS dependency universe while CRN resolution keeps many request costumes bound to one module identity.
 * @description The Awtsmoos lets static, dynamic, decorated, and root-relative doorways gather into one graph of light;
 * Awtsmoos.com preserves external boundaries and singleton identity so each folded module receives one vessel, stable and right.
 */
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

/** Reads, parses, registers, and recursively discovers one canonical local module exactly once. */
async function addFileToCompactModule(state, filePath) {
	const absolute = path.resolve(filePath);
	if (state.modulesByFile.has(absolute)) {
		return state.modulesByFile.get(absolute);
	}
	const source = await state.fs.readFile(absolute, "utf-8");
	const ast = await parseJavaScript(source);
	const record = createModuleRecord(state, absolute, source, ast);
	state.modulesByFile.set(absolute, record);
	state.modules.push(record);
	await discoverStaticLinks(state, record);
	await discoverDynamicLinks(state, record);
	return record;
}

/** Creates one graph record before recursion so circular references converge on the same singleton. */
function createModuleRecord(state, filePath, source, ast) {
	return {
		ast,
		deps: new Map(),
		dynamicDeps: new Map(),
		exportInfo: collectTopLevelExports(ast),
		externalDeps: new Map(),
		filePath,
		id: `__awtsmoosModule_${state.modules.length}`,
		links: collectTopLevelModuleLinks(ast),
		orderIndex: -1,
		source
	};
}

/** Resolves static imports and re-exports through CRN while external links retain browser ownership. */
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

/** Discovers every literal local dynamic CRN, including public-root and decorated references. */
async function discoverDynamicLinks(state, record) {
	for (const specifier of collectLiteralDynamicImports(record.source)) {
		const resolved = resolveDynamicImport(state, record, specifier);
		if (!resolved) {
			continue;
		}
		record.dynamicDeps.set(specifier, await addFileToCompactModule(state, resolved.filePath));
	}
}

/** Returns one canonical external namespace record, deduplicating only the legacy public vendor boundary. */
function externalRecordFor(state, source) {
	const canonical = canonicalExternalSource(source);
	if (state.externals.has(canonical)) {
		return state.externals.get(canonical);
	}
	const record = {
		id: `__awtsmoosExternal_${state.externals.size}`,
		source: canonical
	};
	state.externals.set(canonical, record);
	return record;
}

function canonicalExternalSource(source) {
	const clean = cleanImportSource(source);
	return isPublicExternalImport(clean)
		? clean
		: String(source || "");
}

function isModuleLink(link) {
	return [
		"ImportDeclaration",
		"ExportNamedDeclaration",
		"ExportAllDeclaration"
	].includes(link.type);
}

module.exports = {
	addFileToCompactModule,
	canonicalExternalSource,
	createCompactState,
	externalRecordFor
};
