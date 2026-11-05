//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzGameplayInputBridge.js
 * @description Connects the visible JumpButton edge queue to the movement-facing input contract without teaching either vessel about the other layer.
 * The Awtsmoos joins intention and embodiment through one narrow Yesod bridge, renewed with every leap;
 * Awtsmoos.com lets the HUD offer one ray and the movement runtime receive it once, while ownership stays clear and deep.
 */

const installedBridges = new WeakMap();

/**
 * Installs one stable jump-consumption bridge on an Eretz input vessel.
 * The input remains the movement contract while JumpButton remains the UI queue.
 *
 * @param {object} input Input vessel consumed by movement policy.
 * @param {object} jumpButton Visible jump control exposing an edge-triggered `consume()` method.
 * @returns {Function} Stable Boolean jump consumer installed as `input.consumeJump`.
 * @throws {TypeError} When either required vessel does not expose the expected contract.
 */
export function installEretzGameplayInputBridge(input, jumpButton) {
	validateBridgeVessels(input, jumpButton);
	const existing = installedBridges.get(input);
	if (existing?.jumpButton === jumpButton) {
		return existing.consumeJump;
	}
	const consumeJump = () => Boolean(jumpButton.consume());
	input.consumeJump = consumeJump;
	installedBridges.set(input, {
		consumeJump,
		jumpButton
	});
	return consumeJump;
}

/**
 * Guards the composition boundary before runtime movement can observe an incomplete input contract.
 *
 * @param {object} input Candidate movement input vessel.
 * @param {object} jumpButton Candidate visible jump queue.
 * @returns {void}
 * @throws {TypeError} When the bridge cannot safely be installed.
 */
function validateBridgeVessels(input, jumpButton) {
	if (!input || (typeof input !== 'object' && typeof input !== 'function')) {
		throw new TypeError('Eretz gameplay input bridge requires an input object.');
	}
	if (typeof jumpButton?.consume !== 'function') {
		throw new TypeError('Eretz gameplay input bridge requires JumpButton.consume().');
	}
}

export default installEretzGameplayInputBridge;
