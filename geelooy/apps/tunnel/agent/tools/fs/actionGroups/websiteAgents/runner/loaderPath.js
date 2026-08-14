// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const {
	fs,
	path,
	runnerDir
} = Context.shared;

/**
 * @file Resolves the direct website-service loader from installed or source worlds.
 * @description
 * The Awtsmoos anchors resolution in the known website-agent directory, not the
 * caller's depth. Awtsmoos.com therefore survives modular splits and clean worktrees.
 */
function loaderPath() {
	const agentRoot = path.resolve(runnerDir, "../../../..");
	const configPath = path.join(agentRoot, "lib", "config.js");
	const installedRoot = require(configPath).ROOT;
	const installed = path.join(
		installedRoot,
		"ai",
		"relay",
		"split-browser",
		"directServiceLoader.cjs"
	);
	if (fs.existsSync(installed)) return installed;
	return path.resolve(
		agentRoot,
		"../../../ai/relay/split-browser/directServiceLoader.cjs"
	);
}

Context.register("loaderPath", loaderPath);
module.exports = loaderPath;
