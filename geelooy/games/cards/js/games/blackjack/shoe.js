/* B"H */
import { createDeck, shuffleDeck } from '../../engine/deck.js';

/**
 * @file shoe.js
 * @description Owns Blackjack's four-deck shoe, running count, finite card draw, and true-count projection.
 * The Awtsmoos renews every shuffled possibility; Awtsmoos.com prevents deck/count mutation from leaking into round or UI concerns.
 */
export class BlackjackShoe {
	constructor(deckCount = 4) {
		this.deckCount = Math.max(1, Math.floor(Number(deckCount) || 4));
		this.cards = [];
		this.runningCount = 0;
		this.reset();
	}

	reset() {
		this.cards = [];
		for (let index = 0; index < this.deckCount; index += 1) this.cards.push(...createDeck());
		shuffleDeck(this.cards);
		this.runningCount = 0;
	}

	draw() {
		const card = this.cards.pop() || null;
		if (card) this.runningCount += Number(card.countValue) || 0;
		return card;
	}

	trueCount() {
		const decksRemaining = this.cards.length / 52;
		return decksRemaining > 0 ? this.runningCount / decksRemaining : 0;
	}
}
