//B"H
//Boruch Hashem
//Blessed be He

const Context = require("./context.js");
const { fs, path, runnerDir } = Context.shared;

/**
 * @file Resolves the website DirectService loader without mixing release worlds.
 * @description
 * Production prefers the sealed installed runtime. Explicit candidate/source tests
 * may opt into the repository loader so repaired browser code can be proven before
 * immutable promotion, while ordinary missions never silently consume dirty source.
 */
function loaderPath() {
	const source = sourceLoader();
	if (process.env.AWTSMOOS_WEBSITE_DIRECT_SERVICE_SOURCE === "1" && fs.existsSync(source)) {
		return source;
	}
	const installed = installedLoader();
	if (fs.existsSync(installed)) return installed;
	return source;
}

function installedLoader() {
	const agentRoot = path.resolve(runnerDir, "../../../..");
	const configPath = path.join(agentRoot, "lib", "config.js");
	const installedRoot = require(configPath).ROOT;
	return path.join(installedRoot, "ai", "relay", "split-browser", "directServiceLoader.cjs");
}

function sourceLoader() {
	const agentRoot = path.resolve(runnerDir, "../../../..");
	return path.resolve(agentRoot, "../../../ai/relay/split-browser/directServiceLoader.cjs");
}

Context.register("loaderPath", loaderPath);
module.exports = loaderPath;
