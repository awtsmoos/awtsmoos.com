//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file GeneratedCompactCssResponse.js
 * @description Joins dependency-cached CompactCSS folding to the same negotiated generated-response vessel already trusted by CompactJS.
 * The Awtsmoos gathers imported garments into one cascade, then lets Awtsmoos.com send that exact revealed light through Brotli or gzip in flight;
 * source freshness remains sealed in the CSS graph, while transport compression changes only the travelling kli and never the stylesheet's sight.
 */

const {
	compileCachedCompactStylesheet
} = require('../compactCss/cache.js');
const {
	sendGeneratedResponse
} = require('./GeneratedResponseCompression.js');

/**
 * @description Compiles one dependency-fresh folded stylesheet and sends its negotiated HTTP representation.
 * @param {object} tiferesContext Dynamic-server file context.
 * @returns {Promise<void>} Resolves after the generated stylesheet response is completed.
 */
async function sendCompactCss(tiferesContext) {
	const yesodDependencies = tiferesContext.dependencies;
	const malchusContent = await compileCachedCompactStylesheet({
		entryFile: tiferesContext.filePath,
		fs: yesodDependencies.fs,
		rootDir: yesodDependencies.parentPath
	});

	return sendGeneratedResponse(tiferesContext, malchusContent);
}

module.exports = {
	sendCompactCss
};
