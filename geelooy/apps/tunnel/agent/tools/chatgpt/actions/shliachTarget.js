//B"H
//Boruch Hashem
//Blessed be He

const { requireSplitBrowser } = require("../../../lib/split-browser-require.js");

const Config = requireSplitBrowser("config.cjs");

/**
 * @file Names the one approved Awtsmoos Shliach destination for shared-browser actions.
 * @description
 * The Awtsmoos keeps login, sentinel, and website-agent navigation on one exact custom GPT.
 * Callers never invent a second ChatGPT home URL or silently drift to another destination.
 */

/** Returns the canonical Awtsmoos Shliach custom-GPT URL. */
function url() {
	return Config.configuredAgentStartUrl();
}

/** Returns safe public target identity without browser-local information. */
function publicTarget() {
	return {
		name: "Awtsmoos Shliach",
		url: url()
	};
}

module.exports = {
	publicTarget,
	url
};
