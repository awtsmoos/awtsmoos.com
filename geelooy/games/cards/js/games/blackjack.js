/*B"H*/

import { createDeck, shuffleDeck } from '../engine/deck.js';
import { BlackjackAI } from '../engine/ai/blackjackAI.js';

/**
 * The metaphysical ruleset known as Blackjack, or The Reckoning. A contest
 * of proximity to the number 21, a journey to the edge of
 * perfection without falling into the abyss of excess. This class orchestrates
 * the entire flow of a single, self-contained universe of play, from its
 * genesis to its final judgment and inevitable rebirth.
 */
export class BlackjackGame {
    constructor(players, renderer, ui) {
        this.players = players;
        this.renderer = renderer;
        this.ui = ui;
        this.deck = [];
        this.aiControllers = [];
        this.runningCount = 0;
        this.decksInShoe = 4; // A shoe of 4 decks for a deeper, more complex cosmic count.
    }

    /**
     * The Genesis of the round. A new deck is forged from multiple universes (decks)
     * and shuffled into primordial chaos. The AI intelligences are awakened with
     * a fresh awareness of this new cosmic state, their memories of past realities wiped clean.
     */
    start() {
        this.deck = [];
        for (let i = 0; i < this.decksInShoe; i++) {
            this.deck.push(...createDeck());
        }
        shuffleDeck(this.deck);
        this.runningCount = 0;

        this.players.forEach(p => { p.hand = []; p.status = 'playing'; });

        this.aiControllers = this.players
            .filter(p => p.isAI && !p.isDealer)
            .map(p => new BlackjackAI(p));
        
        this.dealInitialCards();
    }

    /** The initial breath of creation, where two truths are bestowed upon each soul. */
    async dealInitialCards() {
        this.ui.gameStatus.innerText = 'The Reckoning begins...';
        this.ui.playerActions.style.display = 'none';
        for (let i = 0; i < 2; i++) {
            for (const player of this.players) {
                // A dramatic pause between each card, allowing its weight to be felt.
                await this.dealCard(player, false); // Deal silently first
                await this.sleep(200);
            }
        }
        this.renderer.drawGame(this.players); // A single grand reveal
        this.playerTurn();
    }

    /** Deals a single card from the void, updating the cosmic count of the universe. */
    async dealCard(player, shouldRender = true) {
        const card = this.deck.pop();
        if (!card) {
            console.error("The void is empty. The deck has been exhausted.");
            return;
        }
        player.hand.push(card);
        this.updateCount(card);
        if (shouldRender) {
            this.renderer.drawGame(this.players);
        }
    }

    /** The core of the game loop, a chain of promises that guide the turn of each soul. */
    async playerTurn() {
        this.ui.gameStatus.innerText = 'The Self: Make your choice.';
        this.ui.playerActions.style.display = 'block';

        const choice = await this.waitForPlayerChoice();
        
        this.ui.playerActions.style.display = 'none';

        if (choice === 'hit') {
            await this.dealCard(this.players.find(p => !p.isAI && !p.isDealer), true);
            if (this.calculateHandValue(this.players.find(p => !p.isAI && !p.isDealer).hand) > 21) {
                this.players.find(p => !p.isAI && !p.isDealer).status = 'bust';
                this.renderer.drawGame(this.players);
                await this.sleep(1000);
                this.aiTurns();
            } else {
                this.playerTurn();
            }
        } else { // Stand
            this.aiTurns();
        }
    }

    /** Awaits the mortal's decision, bridging the gap between human will and game logic. */
    waitForPlayerChoice() {
        return new Promise(resolve => {
            this.ui.hitButton.onclick = () => resolve('hit');
            this.ui.standButton.onclick = () => resolve('stand');
        });
    }

    /** The inexorable march of the Emanations, each acting with cold, divine logic. */
    async aiTurns() {
        const dealerUpCard = this.players.find(p => p.isDealer).hand[1];
        for (const controller of this.aiControllers) {
            this.ui.gameStatus.innerText = `${controller.player.name}'s turn...`;
            await this.sleep(1000);

            while(this.calculateHandValue(controller.player.hand) < 21) {
                let decision = controller.decideMove(this.getTrueCount(), dealerUpCard);
                if (decision === 'hit') {
                    await this.dealCard(controller.player, true);
                    await this.sleep(500);
                } else {
                    break;
                }
            }
        }
        this.dealerTurn();
    }

    /** The final judgment, where the House reveals its hand and seals the fate of all. */
    async dealerTurn() {
        this.ui.gameStatus.innerText = `The House of Judgment reveals its will...`;
        this.renderer.drawGame(this.players, true); // Reveal the hidden card
        await this.sleep(1000);

        const dealer = this.players.find(p => p.isDealer);
        while(this.calculateHandValue(dealer.hand) < 17) {
            await this.dealCard(dealer, true);
            await this.sleep(1000);
        }
        this.determineWinner();
    }
    
    /** The final reckoning. Scores are tallied, and fates are declared. */
    determineWinner() {
        const dealerScore = this.calculateHandValue(this.players.find(p => p.isDealer).hand);
        const dealerBusted = dealerScore > 21;
        
        let messages = [];

        this.players.filter(p => !p.isDealer).forEach(player => {
            const playerScore = this.calculateHandValue(player.hand);
            if (playerScore > 21) {
                messages.push(`${player.name} overwhelmed (Bust)`);
            } else if (dealerBusted || playerScore > dealerScore) {
                messages.push(`${player.name} finds favor (Win)`);
            } else if (playerScore < dealerScore) {
                messages.push(`${player.name} falls short (Loss)`);
            } else {
                messages.push(`${player.name} finds balance (Push)`);
            }
        });

        this.ui.gameStatus.innerText = messages.join(' | ');
        // The universe holds its breath for 5 seconds before being recreated for a new round.
        setTimeout(() => this.start(), 5000); 
    }
    
    /** Translates the raw essence of cards into a numerical score. Keter (the Ace) is a paradox,
     * being both 1 and 11, and this function resolves its value based on what most benefits the holder. */
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
    
    updateCount(card) { this.runningCount += card.countValue; }
    getTrueCount() { 
        const decksRemaining = (this.deck.length / 52);
        return decksRemaining > 0 ? this.runningCount / decksRemaining : 0;
    }
    sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
}