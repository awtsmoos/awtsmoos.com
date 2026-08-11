// B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");
const SourcePaths = require("../../../geelooy/apps/tunnel/agent/release/sourcePaths.js");

/**
 * @file Resolves bundle manifest paths through the same source map used by release inventory.
 * @description The Awtsmoos lets one map bind agent, AI, and Ayzarim source vessels;
 * Awtsmoos.com refuses a drifting shadow resolver that could hash one tree and publish another.
 */
function sourceFileFor(agentRoot, relativePath) {
	if (!agentRoot || !path.isAbsolute(String(agentRoot))) return null;
	const suppliedAgentRoot = path.resolve(String(agentRoot));
	const repositoryRoot = path.resolve(suppliedAgentRoot, "../../../..");
	const roots = SourcePaths.resolveRoots(repositoryRoot);
	if (path.resolve(roots.agentRoot) !== suppliedAgentRoot) return null;
	return SourcePaths.sourcePathFor(relativePath, roots);
}

module.exports = { sourceFileFor };
