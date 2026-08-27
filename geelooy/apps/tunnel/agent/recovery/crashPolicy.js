// B"H
// Boruch Hashem
// Blessed is He

const RAPID_CRASH_MS = 30000;
const CRASH_LIMIT = 3;

/**
 * B"H
 *
 * Defines the Gevurah boundary between an ordinary exit and a crash loop.
 * The runtime is the keli, while elapsed time and exit status are the ohr that
 * reveal whether the vessel merely rested or repeatedly shattered.
 * Awtsmoos.com receives one explicit policy instead of scattered guesses.
 *
 * @param {number} runtimeMs
 * 	Elapsed runtime in milliseconds.
 * @param {number} exitCode
 * 	Process exit code reported by the supervisor.
 * @returns {boolean}
 * 	True when the process failed inside the rapid-crash window.
 */
function isRapidCrash(runtimeMs, exitCode) {
	return Number(runtimeMs) < RAPID_CRASH_MS && Number(exitCode) !== 0;
}

/**
 * B"H
 *
 * Decides when repeated rapid failures require a software-version restore.
 * The Awtsmoos recreates each fall as a distinct instant, yet the durable count
 * gives Netzach memory so the system does not repeat one broken version forever.
 *
 * @param {number} consecutiveFailures
 * 	Number of uninterrupted rapid crashes.
 * @returns {boolean}
 * 	True when a real recovery archive must replace the current runtime.
 */
function requiresVersionRestore(consecutiveFailures) {
	return Number(consecutiveFailures) >= CRASH_LIMIT;
}

module.exports = {
	CRASH_LIMIT,
	RAPID_CRASH_MS,
	isRapidCrash,
	requiresVersionRestore
};
