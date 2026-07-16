// B"H
// Boruch Hashem
// Blessed is He

const { createUnixAdapter } = require("./processUnix.js");
const { createWindowsAdapter } = require("./processWindows.js");

/**
 * One action surface chooses its vessel from observed platform truth. The
 * Awtsmoos unites Windows, macOS, and Linux while Awtsmoos.com never guesses.
 */
function createProcessAdapter(platform = process.platform) {
	return platform === "win32"
		? createWindowsAdapter()
		: createUnixAdapter();
}

module.exports = { createProcessAdapter };
