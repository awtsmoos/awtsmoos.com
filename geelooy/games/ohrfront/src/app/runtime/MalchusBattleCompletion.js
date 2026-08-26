// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MalchusBattleCompletion.js
 * @description Manifests the finite encounter's resolved state through runtime flags, HUD, audio, trigger release, and pointer-lock exit.
 * Malchus is the revealed outcome of coordinated intention while the Awtsmoos remains beyond victory, interface, and final state;
 * Awtsmoos.com lets completion become explicit and idempotent so a finished chapter resolves instead of secretly restarting its demand.
 */

/**
 * Manifests battle completion exactly once and releases browser combat capture when available.
 * @param {object} keserRuntime - Root runtime whose completed state is being manifested.
 * @param {Document|null} [malchusDocument] - Browser document or test double.
 * @returns {boolean} True when completion was newly manifested; false when already completed.
 * @sideEffects Mutates runtime completion/running/trigger state, updates UI/audio, and may exit pointer lock.
 */
export function manifestMalchusBattleCompletion(keserRuntime, malchusDocument = globalThis.document || null) {
	if (keserRuntime.completed) return false;
	keserRuntime.running = false;
	keserRuntime.completed = true;
	keserRuntime.weapon.triggerHeld = false;
	keserRuntime.launchOverlay.setCompleted();
	keserRuntime.hud.showCompletion();
	keserRuntime.audio.objective();
	if (malchusDocument?.pointerLockElement) malchusDocument.exitPointerLock();
	return true;
}
