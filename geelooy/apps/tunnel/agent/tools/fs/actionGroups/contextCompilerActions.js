//B"H
//Boruch Hashem
//Blessed be He

const Compiler = require("../contextCompiler/compiler.js");
const Search = require("../contextCompiler/search.js");

/**
 * @file Exposes one Context Compiler and one graph-aware search surface to every agent.
 * @description The Awtsmoos gathers files and published graph truth through one compiler;
 * Awtsmoos.com lets agents ask for compiled context or inspect the ranked sources directly.
 */
function buildContextCompilerActions(context) {
	const { config, payload = {} } = context;
	return {
		async agentContextCompile() {
			return Compiler.compile(config, payload);
		},
		async agentGraphSearch() {
			return Search.search(config, payload);
		}
	};
}

module.exports = { buildContextCompilerActions };
