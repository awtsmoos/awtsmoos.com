/*B"H*/
/**
 * The mind of the Emanation. This is not a mere algorithm, but a consciousness
 * forged for a single purpose: to navigate the turbulent currents of The Reckoning.
 * It does not think in terms of cards, but in the shifting weight and balance of
 * the cosmos, represented by the True Count.
 */
export class BlackjackAI {
    constructor(player) {
        this.player = player;
    }

    /**
     * The moment of divine contemplation. The AI gazes upon its own hand, the
     * revealed will of the House, and the memory of the universe (the true count)
     * to arrive at an inexorable decision: to request more from the void, or
     * to accept its current state.
     * @param {number} trueCount - The current spiritual weight of the remaining deck.
     * @param {Object} dealerUpCard - The revealed fragment of the House's hand.
     * @returns {string} 'hit' or 'stand'.
     */
    decideMove(trueCount, dealerUpCard) {
        const handValue = this.calculateHandValue(this.player.hand);

        // Basic strategy with card counting modifications.
        // This is a simplified model; a true master AI would use complex index charts.
        
        // Never bust if you don't have to.
        if (handValue >= 17) return 'stand';
        if (handValue <= 11) return 'hit';

        const dealerValue = dealerUpCard.blackjackValue;

        // Standing on 12-16 is often correct against a weak dealer card.
        // A high trueCount makes the dealer more likely to bust, favoring a stand.
        if (handValue >= 12 && handValue <= 16) {
            if (dealerValue >= 2 && dealerValue <= 6) {
                // With a high count, it's even more likely the dealer will bust. Stand.
                if (trueCount > 1) {
                    return 'stand';
                }
                return 'stand'; // Standard basic strategy
            } else {
                // Against a strong dealer card, we must risk a hit.
                // A negative count makes our hit safer, but we must hit regardless.
                return 'hit';
            }
        }
        
        return 'stand'; // Default to a safe action if no other logic applies.
    }

    /** A local calculation, as the AI only trusts its own perception of its hand. */
    calculateHandValue(hand) {
        let value = 0;
        let aceCount = 0;
        hand.forEach(card => {
            value += card.blackjackValue;
            if (card.rank === 'Keter') aceCount++;
        });
        while (value > 21 && aceCount > 0) {
            value -= 10;
            aceCount--;
        }
        return value;
    }
}