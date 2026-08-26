//B"H
//Boruch Hashem
//Blessed is He

const path = require("path");
const {
	addFileToCompactModule,
	createCompactState
} = require("./graph.js");
const { renderCompactModule } = require("./renderer.js");

/**
 * @file Preserves the public CompactJS compiler doorway while CRN graph, transforms, and rendering live in smaller vessels.
 * @description The Awtsmoos lets a once-monolithic compiler become a narrow gate into many ordered chambers of light;
 * Awtsmoos.com keeps every historic public function stable while canonical resource identity now guides the deeper flight.
 */

/** Compiles one JavaScript entry file through the CRN-backed dependency graph into browser ESM. */
async function compileCompactModule(options) {
	const entryFile = path.resolve(options.entryFile);
	const rootDir = path.resolve(options.rootDir);
	const state = createCompactState(
		options.fs,
		entryFile,
		rootDir
	);
	const entry = await addFileToCompactModule(
		state,
		entryFile
	);
	return renderCompactModule(state, entry);
}

/** Preserves the historic per-file source marker helper used by tests and compatibility callers. */
function wrapChunk(filePath, rootDir, body) {
	const relative = path.relative(
		rootDir,
		filePath
	).split(path.sep).join("/");
	return `\n/* B\\"H compact source: ${relative} */\n${body}\n`;
}

module.exports = {
	addFileToCompactModule,
	compileCompactModule,
	renderCompactModule,
	wrapChunk
};
