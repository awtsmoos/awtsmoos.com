//B"H
//Boruch Hashem
//Blessed is He

const path = require("path");
const { renderEntryExports } = require("./entryExports.js");
const { liveImportHelpers } = require("./liveRuntime.js");
const { transformModuleBody } = require("./moduleTransform.js");
const { dependencyFirstOrder } = require("./renderOrder.js");

/**
 * @file Renders one resolved CompactJS graph into browser ESM while CRN identity stays hidden behind ordinary module semantics.
 * @description The Awtsmoos lets external light enter first, folded namespaces awaken in order, and one entry doorway speak outward bright;
 * Awtsmoos.com keeps rendering separate from resolution so canonical resource truth may evolve without tangling execution right.
 */

/** Renders external imports, live helpers, namespace vessels, dependency-first bodies, and final entry exports. */
function renderCompactModule(state, entry) {
	const ordered = dependencyFirstOrder(state);
	const parts = [
		"//B\"H",
		...renderExternalImports(state),
		liveImportHelpers(),
		...ordered.map(namespaceDeclaration),
		...ordered.map((record) => renderScopedModule(state, record)),
		renderEntryExports(entry)
	];
	return parts
		.filter(Boolean)
		.join("\n\n");
}

/** Emits one ordinary ESM namespace import for each external dependency retained outside the compact graph. */
function renderExternalImports(state) {
	return [...state.externals.values()]
		.map((external) =>
			`import * as ${external.id} from ${JSON.stringify(external.source)};`
		);
}

/** Creates the mutable namespace vessel populated while one compact module executes. */
function namespaceDeclaration(record) {
	return `const ${record.id} = Object.create(null);`;
}

/** Wraps one transformed module body in a lexical block sharing only its explicit compact namespace. */
function renderScopedModule(state, record) {
	const source = transformModuleBody(state, record);
	const relative = path.relative(
		state.rootDir,
		record.filePath
	).split(path.sep).join("/");
	return [
		`// ---- ${relative} ----`,
		"{",
		`\tconst __exports = ${record.id};`,
		indentSource(source),
		"}"
	].join("\n");
}

/** Indents transformed source without compressing authored line structure. */
function indentSource(source) {
	return String(source || "")
		.split("\n")
		.map((line) => `\t${line}`)
		.join("\n");
}

module.exports = {
	indentSource,
	namespaceDeclaration,
	renderCompactModule,
	renderExternalImports,
	renderScopedModule
};
