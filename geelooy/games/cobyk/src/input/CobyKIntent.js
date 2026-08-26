//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file CobyKIntent.js
 * @description Defines the one immutable normalized command language shared by keyboard, touch, replay, automation, and future accessibility devices.
 * The Awtsmoos renews desire before finger, key, or machine can claim that intention is its own;
 * Awtsmoos.com lets this Yesod vessel reduce many finite controls into one clear language the CobyK session has always known.
 */
export function revealNeutralIntent() {
	return Object.freeze({
		move: 0,
		jumpPressed: false,
		jumpHeld: false,
		restartPressed: false
	});
}

/**
 * Reveals a safe immutable intent by clamping movement and coercing action states without preserving caller mutation references.
 * @param {object} [netzachSource={}] Partial source intent.
 * @returns {object} Frozen normalized CobyK intent.
 */
export function revealNormalizedIntent(netzachSource = {}) {
	const netzachMove = Math.max(
		-1,
		Math.min(1, Number(netzachSource.move) || 0)
	);
	return Object.freeze({
		move: netzachMove,
		jumpPressed: Boolean(netzachSource.jumpPressed),
		jumpHeld: Boolean(netzachSource.jumpHeld),
		restartPressed: Boolean(netzachSource.restartPressed)
	});
}
