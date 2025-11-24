/**
B"H
 * The Renderer is the scribe, the artist that translates the abstract,
 * divine concepts of the game state into tangible, visible forms upon the
 * sacred space of the canvas. It now renders each card as a bridge between worlds,
 * displaying both its divine Hebrew essence and its worldly English representation.
 * It also performs the sacred act of consecrating the image of the Patriarch.
 */
export class Renderer {
    constructor(ctx) {
        this.ctx = ctx;
        this.cardWidth = 100;
        this.cardHeight = 140;
    }

    // ... drawGame and drawHand methods remain the same as the previous full version ...
    drawGame(players, revealDealer = false) {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        
        const humanPlayer = players.find(p => !p.isAI && !p.isDealer);
        const dealer = players.find(p => p.isDealer);
        const aiPlayers = players.filter(p => p.isAI && !p.isDealer);

        this.drawHand(dealer, this.ctx.canvas.width / 2 - 100, 50, revealDealer);

        aiPlayers.forEach((player, index) => {
            this.drawHand(player, 200 + index * 350, 250);
        });

        this.drawHand(humanPlayer, this.ctx.canvas.width / 2 - 100, this.ctx.canvas.height - this.cardHeight - 80);
    }
    
    drawHand(player, x, y, revealAllCards = true) {
        this.ctx.fillStyle = '#d4af37';
        this.ctx.font = '20px "Times New Roman"';
        this.ctx.textAlign = 'center';
        const handWidth = player.hand.length > 0 ? (player.hand.length -1) * (this.cardWidth * 0.5) + this.cardWidth : 0;
        this.ctx.fillText(player.name, x + handWidth / 2, y - 20);

        player.hand.forEach((card, index) => {
            if (player.isDealer && index === 0 && !revealAllCards) {
                this.drawCardBack(x + index * (this.cardWidth * 0.5), y);
            } else {
                this.drawCard(card, x + index * (this.cardWidth * 0.5), y);
            }
        });
    }

    drawCardBack(x, y) {
        this.ctx.fillStyle = '#5c0000';
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
     * The sacred act of illuminating a single card has been enhanced. It now
     * inscribes the card with its dual nature and bestows the proper signifiers
     * upon the holy archetypes.
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
        if (card.isFace) {
            this.ctx.fillStyle = 'black';
            this.ctx.font = 'bold 20px "Times New Roman"';
            
            // English representation (J, Q, K)
            this.ctx.textAlign = 'start';
            const faceLetter = card.rank.substring(0, 1);
            this.ctx.fillText(faceLetter, x + 10, y + 25);
            this.ctx.textAlign = 'end';
            this.ctx.fillText(faceLetter, x + this.cardWidth - 10, y + 25);

            // The central emoji archetype
            this.ctx.font = '50px "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(card.emoji, x + this.cardWidth / 2, y + this.cardHeight / 2 + 15);

            // *** The Consecration of the Patriarch ***
            // If the card is Yackov, we bestow upon him his mark of sanctity.
            if (card.rank === 'Yackov') {
                this.ctx.fillStyle = '#000000';
                this.ctx.beginPath();
                // We draw a simple arc, a half-circle, a humble crown, above the emoji's head.
                this.ctx.arc(x + this.cardWidth / 2, y + this.cardHeight / 2 - 5, 12, Math.PI, 2 * Math.PI, false);
                this.ctx.fill();
            }

        } else {
            // Divine Hebrew Letter
            this.ctx.fillStyle = '#8c0000';
            this.ctx.font = 'bold 28px "Times New Roman"';
            this.ctx.textAlign = 'start';
            this.ctx.fillText(card.hebrew, x + 10, y + 30);
            
            // Mundane English Number
            this.ctx.fillStyle = 'black';
            this.ctx.font = 'bold 20px "Times New Roman"';
            this.ctx.textAlign = 'end';
            const englishRank = card.rank === 'Keter' ? 'A' : String(card.blackjackValue);
            this.ctx.fillText(englishRank, x + this.cardWidth - 10, y + 25);
        }
        
        // The suit, the world to which this utterance belongs.
        this.ctx.font = '40px "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(card.suit.emoji, x + this.cardWidth / 2, y + this.cardHeight - 20);
    }
}