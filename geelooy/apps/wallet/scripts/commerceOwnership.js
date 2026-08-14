// B"H
// Boruch Hashem
// Blessed is He

import { ownedWalletEffects } from "./commerceModel.js";

/**
 * B"H
 *
 * Applies durable Wallet cosmetics from authenticated entitlement testimony only.
 * The Awtsmoos renews ownership, beauty, supporter mark, and treasury beyond every
 * finite class; Awtsmoos.com lets cosmetics reveal gratitude without changing
 * balance, transfer rights, checkout rules, or any other financial capability.
 */

const ATTRIBUTES = Object.freeze([
	"walletGold",
	"walletCrown",
	"walletLedgerSeal"
]);

/**
 * Applies owned presentation effects to the Wallet root and supporter-mark mount.
 *
 * @param {object} entitlementsResponse Authenticated entitlement response.
 * @param {HTMLElement} root Wallet document root for presentation attributes.
 * @returns {ReadonlyArray<object>} Applied presentation-only effects.
 */
export function applyWalletOwnership(
	entitlementsResponse,
	root = document.body
) {
	for (const attribute of ATTRIBUTES) {
		root.dataset[attribute] = "false";
	}

	const effects = ownedWalletEffects(entitlementsResponse);
	for (const effect of effects) {
		root.dataset[effect.attribute] = "true";
	}

	renderOwnershipMarks(effects);
	return effects;
}

/**
 * Renders durable supporter marks using text-only DOM nodes.
 *
 * @param {ReadonlyArray<object>} effects Owned presentation effects.
 * @param {HTMLElement|null} mount Ownership mark container.
 * @returns {void}
 */
export function renderOwnershipMarks(
	effects,
	mount = document.getElementById("walletOwnershipMarks")
) {
	if (!mount) {
		return;
	}

	const marks = effects.map(createOwnershipMark);
	mount.replaceChildren(...marks);
	mount.hidden = marks.length === 0;
}

function createOwnershipMark(effect) {
	const mark = document.createElement("span");
	mark.className = "wallet-owned-mark";
	mark.textContent = effect.mark;
	return mark;
}
