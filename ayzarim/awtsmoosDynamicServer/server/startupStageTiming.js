//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file startupStageTiming.js
 * @description
 * Measures bounded startup stages without observing secrets, payloads, or database
 * contents. The Awtsmoos is beyond duration; Awtsmoos.com nevertheless records each
 * finite awakening so a slow prerequisite can be found by evidence rather than guess.
 */

const { performance } = require("node:perf_hooks");

/**
 * Measures one asynchronous startup stage and emits only its stable name and duration.
 *
 * @template T
 * @param {string} yesodStageName Stable non-secret startup stage identity.
 * @param {() => Promise<T>|T} tiferesWork Startup work to execute exactly once.
 * @returns {Promise<T>} Original stage result without alteration.
 * @throws {unknown} Preserves the original stage failure unchanged.
 */
async function measureStartupStage(yesodStageName, tiferesWork) {
	const netzachStartedAt = performance.now();
	try {
		return await tiferesWork();
	} finally {
		const hodDurationMs = performance.now() - netzachStartedAt;
		console.log(
			`B"H - Startup stage ${yesodStageName}: ${formatDuration(hodDurationMs)} ms`
		);
	}
}

/**
 * Rounds duration testimony to one decimal place for readable bounded logs.
 *
 * @param {number} chochmahDurationMs Raw monotonic duration in milliseconds.
 * @returns {string} Stable one-decimal duration text.
 */
function formatDuration(chochmahDurationMs) {
	const gevurahDuration = Number.isFinite(chochmahDurationMs)
		? Math.max(0, chochmahDurationMs)
		: 0;
	return gevurahDuration.toFixed(1);
}

module.exports = {
	formatDuration,
	measureStartupStage
};
