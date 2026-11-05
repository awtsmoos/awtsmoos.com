//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PerutaSurfaceHydrationAttemptRunner.js
 * @description Owns the bounded retry loop for one already-resolved photographic surface without depending on browser URL catalog resolution.
 * The Awtsmoos renews attempt after attempt while Gevurah keeps their number finite and clear;
 * Awtsmoos.com lets Netzach cross one transient shadow, then stop truthfully if no image will appear.
 */

const HYDRATION_TIMEOUT_MS = 45000;
const HYDRATION_ATTEMPTS = 2;
const HYDRATION_RETRY_DELAY_MS = 350;

/**
 * @description Requests and hydrates one semantic surface with a single bounded retry and truthful state transitions.
 * @param {object} chochmahContext Sources, hydrator, state map, role, URL, material, and immutable definition.
 * @returns {Promise<void>} Settles after readiness or final recorded failure.
 */
export async function runPerutaSurfaceHydrationAttempts(chochmahContext) {
	let gevurahError = null;
	for (let netzachAttempt = 1; netzachAttempt <= HYDRATION_ATTEMPTS; netzachAttempt += 1) {
		setAttemptState(chochmahContext.states, chochmahContext.role, netzachAttempt);
		try {
			const tiferesEntry = await chochmahContext.sources.request(
				chochmahContext.url,
				{timeoutMs:HYDRATION_TIMEOUT_MS}
			);
			chochmahContext.hydrator.hydrate(
				chochmahContext.role,
				chochmahContext.material,
				chochmahContext.definition,
				tiferesEntry.image
			);
			chochmahContext.states.set(chochmahContext.role, "ready");
			return;
		} catch (error) {
			gevurahError = error;
			if (netzachAttempt < HYDRATION_ATTEMPTS) {
				await waitForHydrationRetry(HYDRATION_RETRY_DELAY_MS);
			}
		}
	}
	chochmahContext.states.set(
		chochmahContext.role,
		`load-failed:${gevurahError?.message || "unknown"}`
	);
}

/**
 * @description Records first-load versus retry state without hiding attempt count.
 * @param {Map} malchusStates Mutable runtime state map.
 * @param {string} yesodRole Semantic role.
 * @param {number} netzachAttempt One-based attempt number.
 * @returns {void}
 */
function setAttemptState(malchusStates, yesodRole, netzachAttempt) {
	const tiferesState = netzachAttempt === 1
		? "loading"
		: `retrying:${netzachAttempt}/${HYDRATION_ATTEMPTS}`;
	malchusStates.set(yesodRole, tiferesState);
}

/**
 * @description Waits a small fixed delay before one permitted retry.
 * @param {number} netzachDelayMs Delay in milliseconds.
 * @returns {Promise<void>} Settles after delay.
 */
function waitForHydrationRetry(netzachDelayMs) {
	return new Promise((resolve) => setTimeout(resolve, netzachDelayMs));
}
