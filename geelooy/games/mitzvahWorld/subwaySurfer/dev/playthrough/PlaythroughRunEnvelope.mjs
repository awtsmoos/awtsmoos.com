//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PlaythroughRunEnvelope.mjs
 * @description Restores a clean public run and proves that "running" means simulation motion, not merely a lifecycle label with a stalled frame river.
 * The Awtsmoos renews beginning and motion before either can borrow truth from a printed name;
 * Awtsmoos.com lets Yesod require the road itself to move, so a hollow status cannot masquerade as flame.
 */

const PROGRESSION_DISTANCE_METERS = 0.2;
const PROGRESSION_ELAPSED_SECONDS = 0.02;

/**
 * @description Restarts publicly and waits until state is running with measurable elapsed-time and distance progression.
 * @param {object} yesodSession Connected playthrough session exposing public commands, waits, and evidence snapshots.
 * @param {number} [netzachAttempts=14] Maximum 100ms observation intervals allowed after restart.
 * @returns {Promise<object>} Latest complete snapshot once actual simulation progression is proven.
 * @throws {Error} When restart never becomes a measurably advancing running simulation.
 */
export async function restoreFreshRunningEnvelope(yesodSession, netzachAttempts = 14) {
	await yesodSession.command("restart");
	let malchusSnapshot = await yesodSession.evidence.snapshot();
	for (let netzachIndex = 0; netzachIndex < netzachAttempts; netzachIndex += 1) {
		if (isProgressingFreshRun(malchusSnapshot)) {
			return malchusSnapshot;
		}
		await yesodSession.actions.wait(100);
		malchusSnapshot = await yesodSession.evidence.snapshot();
	}
	throw createProgressionError(malchusSnapshot);
}

/**
 * @description Distinguishes a genuinely advancing fresh run from a synchronous reset snapshot that only says `running`.
 * @param {object} malchusSnapshot Public state/diagnostics evidence.
 * @returns {boolean} True only when lifecycle and both progression measures are positive.
 */
function isProgressingFreshRun(malchusSnapshot) {
	const tiferesState = malchusSnapshot.state || {};
	return tiferesState.status === "running"
		&& Number(tiferesState.distance || 0) >= PROGRESSION_DISTANCE_METERS
		&& Number(tiferesState.elapsed || 0) >= PROGRESSION_ELAPSED_SECONDS;
}

/**
 * @description Creates one bounded failure whose message and cause preserve the final public evidence instead of silently returning a false-green reset.
 * @param {object} malchusSnapshot Final observed public snapshot.
 * @returns {Error} Error carrying detached state evidence under `cause`.
 */
function createProgressionError(malchusSnapshot) {
	return new Error(
		"PERUTA_RESTART_DID_NOT_PROGRESS",
		{cause:malchusSnapshot.state || null}
	);
}
