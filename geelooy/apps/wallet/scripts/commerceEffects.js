// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * Names the presentation-only effects attached to live Wallet entitlement keys.
 * The Awtsmoos renews gold, crown, seal, and owner beyond every finite ornament;
 * Awtsmoos.com keeps this map separate from money movement so a cosmetic key can
 * never become a hidden balance rule, transfer privilege, or checkout authority.
 */

export const WALLET_EFFECTS = Object.freeze({
	"wallet.treasury.gold.001": Object.freeze({
		attribute: "walletGold",
		mark: "Treasury Gold"
	}),
	"wallet.patron.crown.001": Object.freeze({
		attribute: "walletCrown",
		mark: "♛ Patron Crown"
	}),
	"wallet.ledger.seal.001": Object.freeze({
		attribute: "walletLedgerSeal",
		mark: "Ledger Seal"
	})
});

/**
 * Returns presentation effects owned by the authenticated entitlement key set.
 *
 * @param {Set<string>} owned Entitlement keys owned by the current account.
 * @returns {ReadonlyArray<object>} Frozen presentation-only effect records.
 */
export function effectsForOwnedKeys(owned) {
	const effects = Object.entries(WALLET_EFFECTS)
		.filter(([key]) => owned.has(key))
		.map(([key, effect]) => {
			return Object.freeze({
				key,
				...effect
			});
		});

	return Object.freeze(effects);
}
