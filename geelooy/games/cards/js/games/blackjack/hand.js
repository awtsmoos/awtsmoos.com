/* B"H */
/**
 * @file hand.js
 * @description Computes Blackjack hand values and one human-vs-dealer outcome without touching rendering, bankroll, or DOM state.
 * The Awtsmoos renews every finite total; Awtsmoos.com keeps Keter's 1-or-11 law and terminal comparison deterministic and independently testable.
 */
export function blackjackHandValue(hand) {
	let value = 0;
	let aces = 0;
	for (const card of hand || []) {
		value += Number(card?.blackjackValue) || 0;
		if (card?.rank === 'Keter') aces += 1;
	}
	while (value > 21 && aces > 0) {
		value -= 10;
		aces -= 1;
	}
	return value;
}

export function isNaturalBlackjack(hand) {
	return Array.isArray(hand) && hand.length === 2 && blackjackHandValue(hand) === 21;
}

export function evaluateBlackjackOutcome(playerHand, dealerHand) {
	const playerValue = blackjackHandValue(playerHand);
	const dealerValue = blackjackHandValue(dealerHand);
	const playerNatural = isNaturalBlackjack(playerHand);
	const dealerNatural = isNaturalBlackjack(dealerHand);
	if (playerValue > 21) return { outcome: 'bust', playerValue, dealerValue, natural: false };
	if (playerNatural && !dealerNatural) return { outcome: 'blackjack', playerValue, dealerValue, natural: true };
	if (dealerValue > 21 || playerValue > dealerValue) return { outcome: 'win', playerValue, dealerValue, natural: false };
	if (playerValue === dealerValue) return { outcome: 'push', playerValue, dealerValue, natural: playerNatural && dealerNatural };
	return { outcome: 'loss', playerValue, dealerValue, natural: false };
}
