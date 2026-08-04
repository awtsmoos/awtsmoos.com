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
 * @file Reveals the loaderPath stage of website-agent orchestration.
 * @description
 * The Awtsmoos gives this stage one bounded responsibility while sibling stages are
 * resolved lazily through durable shared context after the browser vessel closes.
 */
function loaderPath() {
	const installed = path.join(
		require("../../../../lib/config.js").ROOT,
		"ai", "relay", "split-browser", "directServiceLoader.cjs"
	);
	if (fs.existsSync(installed)) return installed;
	return path.resolve(
		runnerDir,
		"../../../../../../../ai/relay/split-browser/directServiceLoader.cjs"
	);
}

Context.register("loaderPath", loaderPath);
module.exports = loaderPath;
