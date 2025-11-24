/*B"H*/

/**
 * The Renderer is the scribe, the artist that translates the abstract,
 * divine concepts of the game state into tangible, visible forms upon the
 * sacred space of the canvas. It does not create, but reveals what already is,
 * including the crucial act of concealment—hiding the dealer's first card,
 * representing the unknown aspects of divine judgment.
 */
export class Renderer {
    constructor(ctx) {
        this.ctx = ctx;
        this.cardWidth = 100;
        this.cardHeight = 140;
    }

    /**
     * Draws the entirety of the known universe—the table, the players, and their
     * hands—in a single, frozen moment of perception.
     * @param {Array<Object>} players - All beings, human and otherwise, in the game.
     * @param {boolean} revealDealer - Whether the dealer's hidden truth is revealed.
     */
    drawGame(players, revealDealer = false) {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        
        const humanPlayer = players.find(p => !p.isAI && !p.isDealer);
        const dealer = players.find(p => p.isDealer);
        const aiPlayers = players.filter(p => p.isAI && !p.isDealer);

        // Draw the dealer at the top, the seat of judgment.
        this.drawHand(dealer, this.ctx.canvas.width / 2 - 100, 50, revealDealer);

        // Draw the AI players in an arc, like a celestial council.
        aiPlayers.forEach((player, index) => {
            this.drawHand(player, 200 + index * 350, 250);
        });

        // Draw the human player at the bottom, the central viewpoint of this reality.
        this.drawHand(humanPlayer, this.ctx.canvas.width / 2 - 100, 550);
    }

    /**
     * Renders the hand of a single player, a small constellation of fate and
     * choice. It translates the abstract data of their cards into visible glyphs.
     * @param {Object} player - The player whose hand is to be revealed.
     * @param {number} x - The starting horizontal point of revelation.
     * @param {number} y - The vertical anchor point for this player's reality.
     * @param {boolean} revealAllCards - A special parameter for the dealer, to
     * determine if their concealed truth should be shown.
     */
    drawHand(player, x, y, revealAllCards = true) {
        this.ctx.fillStyle = '#d4af37';
        this.ctx.font = '20px "Times New Roman"';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(player.name, x + (player.hand.length * (this.cardWidth / 2)), y - 20);

        player.hand.forEach((card, index) => {
            if (player.isDealer && index === 0 && !revealAllCards) {
                this.drawCardBack(x + index * (this.cardWidth * 0.5), y);
            } else {
                this.drawCard(card, x + index * (this.cardWidth * 0.5), y);
            }
        });
    }
    
    /**
     * The act of drawing a veil. This renders the back of a card, a symbol of
     * all that is hidden, potential, and unknown. The Aleph upon it signifies
     * that even in concealment, the unity of the Creator is present.
     * @param {number} x - The horizontal coordinate on the canvas.
     * @param {number} y - The vertical coordinate on the canvas.
     */
    drawCardBack(x, y) {
        this.ctx.fillStyle = '#5c0000'; // A deep, wine-red, the color of severity and concealment.
        this.ctx.strokeStyle = '#d4af37';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.roundRect(x, y, this.cardWidth, this.cardHeight, [10]);
        this.ctx.fill();
        this.ctx.stroke();

        this.ctx.fillStyle = '#d4af37';
        this.ctx.font = '80px "Times New Roman"';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('א', x + this.cardWidth / 2, y + this.cardHeight / 2 + 30);
    }
    
    /**
     * The sacred act of illuminating a single card, of giving form to a sliver
     * of the divine will. It renders the background, the suit, the rank, and the
     * very soul of the card onto the canvas.
     * @param {Object} card - The card object, a packet of cosmic data.
     * @param {number} x - The horizontal coordinate on the canvas.
     * @param {number} y - The vertical coordinate on the canvas.
     */
    drawCard(card, x, y) {
        // The physical vessel of the card
        this.ctx.fillStyle = 'white';
        this.ctx.strokeStyle = '#d4af37';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.roundRect(x, y, this.cardWidth, this.cardHeight, [10]);
        this.ctx.fill();
        this.ctx.stroke();

        // The glyphs of power that define it
        this.ctx.textAlign = 'start';
        if (card.isFace) {
            this.ctx.fillStyle = 'black';
            this.ctx.font = 'bold 20px "Times New Roman"';
            this.ctx.fillText(card.rank.substring(0, 1), x + 10, y + 25);
            this.ctx.font = '50px "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(card.emoji, x + this.cardWidth / 2, y + this.cardHeight / 2 + 15);
        } else {
            this.ctx.fillStyle = '#8c0000';
            this.ctx.font = 'bold 28px "Times New Roman"';
            this.ctx.fillText(card.hebrew, x + 10, y + 30);
        }
        
        this.ctx.font = '40px "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(card.suit.emoji, x + this.cardWidth / 2, y + this.cardHeight - 20);
    }
}