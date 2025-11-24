/**
B"H
 * This is not a renderer. This is The Scribe. It is the active will that translates
 * the abstract, formless computations of the game's soul into a perceivable, illuminated
 * reality upon the Loom of the Canvas. It does not draw images; it channels light
 * and shadow, summons substance from the void, and gives form to the holy archetypes.
 * Every function herein is a sacred act, a brushstroke upon the face of creation.
 */
export class Renderer {
    /**
     * The Scribe is summoned and given its Quill, the rendering context. It immediately
     * perceives the dimensions of the reality it must illuminate and prepares the
     * fundamental textures of existence.
     * @param {CanvasRenderingContext2D} ctx - The Quill of Creation, the interface to the Loom.
     */
    constructor(ctx) {
        this.ctx = ctx;
        this.canvas = ctx.canvas;
        this.cardWidth = 110;
        this.cardHeight = 154;

        // The Scribe pre-weaves the very texture of the void, a subtle noise that gives
        // the abyss a sense of tangible infinity. This is done once, for all time.
        this.tableTexture = this._createTexture();
    }

    /**
     * A private incantation to weave the fabric of the game table. It creates a pattern
     * of near-imperceptible noise, ensuring the background is not a flat, dead color,
     * but a deep, vibrating field of potential.
     * @returns {CanvasPattern} A reusable pattern representing the cloth of reality.
     */
    _createTexture() {
        const patternCanvas = document.createElement('canvas');
        const patternCtx = patternCanvas.getContext('2d');
        patternCanvas.width = 100;
        patternCanvas.height = 100;
        const imageData = patternCtx.createImageData(100, 100);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            const value = Math.random() * 25;
            data[i] = value;     // R
            data[i + 1] = value + 20; // G
            data[i + 2] = value;     // B
            data[i + 3] = 255;   // A
        }
        patternCtx.putImageData(imageData, 0, 0);
        return this.ctx.createPattern(patternCanvas, 'repeat');
    }

    /**
 * The grand act of Illumination. The Scribe first lays down the foundation of the
 * world, then, with a new understanding of celestial mechanics, places each soul
 * in its own distinct, non-overlapping firmament.
 * @param {Array<Object>} players - The cast of souls inhabiting this reality.
 * @param {boolean} revealDealer - A decree on whether to lift the veil of judgment.
 */
drawGame(players, revealDealer = false) {
    // Phase 1: Weaving the world (remains the same).
    this.ctx.fillStyle = this.tableTexture;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const radialGradient = this.ctx.createRadialGradient(this.canvas.width / 2, this.canvas.height / 2, 50, this.canvas.width / 2, this.canvas.height / 2, this.canvas.width * 0.7);
    radialGradient.addColorStop(0, 'rgba(0, 20, 0, 0)');
    radialGradient.addColorStop(1, 'rgba(0, 0, 0, 0.7)');
    this.ctx.fillStyle = radialGradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Phase 2: Placing the souls in their rightful heavens.
    const humanPlayer = players.find(p => !p.isAI && !p.isDealer);
    const dealer = players.find(p => p.isDealer);
    const aiPlayers = players.filter(p => p.isAI && !p.isDealer);

    // THE CORRECTION: Each player type is given its own vertical domain.
    // The House of Judgment sits at the highest point.
    this.drawHand(dealer, { x: this.canvas.width / 2, y: this.cardHeight * 0.8 }, revealDealer);
    
    // The Emanations reside in the middle world, well below the House.
    aiPlayers.forEach((player, index) => {
         // This simple layout centers one AI. More complex logic would be needed for multiple AIs.
         this.drawHand(player, { x: this.canvas.width / 2, y: this.canvas.height * 0.5 }, true);
    });

    // The Self resides at the bottom, the foundation of the world.
    this.drawHand(humanPlayer, { x: this.canvas.width / 2, y: this.canvas.height - this.cardHeight * 0.8 });
}

/**
 * Renders a constellation of truths—a single hand—anchored to a point in the void.
 * The name of the soul is now inscribed *above* the cards, never upon them.
 * @param {Object} player - The soul whose fate is to be rendered.
 * @param {{x: number, y: number}} layout - The anchor point in the cosmos for the HAND.
 * @param {boolean} revealAllCards - Whether this constellation is fully visible.
 */
drawHand(player, layout, revealAllCards = true) {
    const handWidth = player.hand.length > 0 ? (player.hand.length - 1) * (this.cardWidth * 0.5) + this.cardWidth : this.cardWidth;
    const startX = layout.x - handWidth / 2;
    
    // THE CORRECTION: The name is inscribed at a position relative to the cards,
    // ensuring it is always above them in a clear, defined space.
    const nameY = layout.y - (this.cardHeight / 2) - 20;

    this.ctx.save();
    this.ctx.font = 'bold 24px "Times New Roman"';
    this.ctx.textAlign = 'center';
    this.ctx.shadowColor = 'black';
    this.ctx.shadowBlur = 5;
    this.ctx.fillStyle = '#d4af37';
    this.ctx.fillText(player.name, layout.x, nameY);
    this.ctx.restore();

    // The cards are drawn at the provided y-coordinate, below the name.
    player.hand.forEach((card, index) => {
        const cardX = startX + index * (this.cardWidth * 0.5);
        if (player.isDealer && index === 0 && !revealAllCards) {
            this.drawCardBack(cardX, layout.y);
        } else {
            this.drawCard(card, cardX, layout.y);
        }
    });
}

    /**
     * Summons a single, fully illuminated Tablet of Truth from the void.
     * This is the heart of the Scribe's craft, a multi-layered ritual of light,
     * shadow, and holy inscription.
     * @param {Object} card - The divine data packet to be given form.
     * @param {number} x - The horizontal anchor.
     * @param {number} y - The vertical anchor.
     */
    drawCard(card, x, y) {
        this.ctx.save();
        this.ctx.translate(x, y);

        // Ritual Part 1: Summoning the vessel. A tablet of ethereal, polished marble.
        this.ctx.shadowColor = 'rgba(0,0,0,0.7)';
        this.ctx.shadowBlur = 25;
        this.ctx.shadowOffsetY = 10;
        const gradient = this.ctx.createLinearGradient(0, 0, this.cardWidth, this.cardHeight);
        gradient.addColorStop(0, '#f5f5f5');
        gradient.addColorStop(1, '#e0e0e0');
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.roundRect(0, 0, this.cardWidth, this.cardHeight, 12);
        this.ctx.fill();
        this.ctx.shadowColor = 'transparent'; // End the shadow casting.
        
        // Ritual Part 2: Edging with divine gold.
        this.ctx.strokeStyle = '#b8860b';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();

        // Ritual Part 3: The Inscriptions.
        const englishRank = card.rank === 'Keter' ? 'A' : (card.isFace ? card.rank.substring(0,1) : String(card.value));
        const hebrew = card.isFace ? '' : card.hebrew;

        // Inscribe the Worldly glyph (English)
        this.ctx.fillStyle = card.suit.name === 'Divine Might' || card.suit.name === 'Sanctified Vessel' ? '#8c0000' : '#000000';
        this.ctx.font = 'bold 24px "Times New Roman"';
        this.ctx.textAlign = 'start';
        this.ctx.fillText(englishRank, 12, 30);

        // Inscribe the Holy glyph (Hebrew)
        this.ctx.fillStyle = '#b8860b';
        this.ctx.font = '32px "Times New Roman"';
        this.ctx.textAlign = 'end';
        this.ctx.shadowColor = 'rgba(255,223,186,0.5)';
        this.ctx.shadowBlur = 8;
        this.ctx.fillText(hebrew, this.cardWidth - 12, 38);
        this.ctx.shadowColor = 'transparent';

        // Ritual Part 4: Channeling the Archetype.
        if (card.isFace) {
             this._drawFaceCardArchetype(card);
        } else {
            // For number cards, the suit is the central figure.
            this.ctx.font = '60px "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(card.suit.emoji, this.cardWidth / 2, this.cardHeight / 2 + 20);
        }

        this.ctx.restore();
    }
    
    /**
     * A specialized ritual for rendering the holy faces, the bridge between the
     * divine and the mundane.
     * @param {Object} card - The face card to be given its true form.
     */
    _drawFaceCardArchetype(card) {
        this.ctx.textAlign = 'center';
        this.ctx.font = '70px "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"';
        this.ctx.fillText(card.emoji, this.cardWidth / 2, this.cardHeight / 2 + 25);

        if (card.rank === 'Yackov') {
            this.ctx.fillStyle = 'rgba(0,0,0,0.8)';
            this.ctx.beginPath();
            this.ctx.arc(this.cardWidth / 2, this.cardHeight / 2 - 8, 15, Math.PI, 2 * Math.PI, false);
            this.ctx.fill();
        } else if (card.rank === 'King David') {
            this.ctx.save();
            this.ctx.fillStyle = '#FFD700';
            this.ctx.shadowColor = '#FFFF00';
            this.ctx.shadowBlur = 10;
            this.ctx.font = '20px "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"';
            this.ctx.fillText('✨', this.cardWidth / 2 + 15, this.cardHeight / 2 - 15); // A glint on the crown
            this.ctx.restore();
        }
    }

    /**
     * Draws a veil over a truth, rendering the back of a Tablet. It is not empty,
     * but sealed with the Aleph, the mark of the Creator's unity, the potential for all things.
     * @param {number} x - The horizontal anchor.
     * @param {number} y - The vertical anchor.
     */
    drawCardBack(x, y) {
        this.ctx.save();
        this.ctx.translate(x, y);

        this.ctx.shadowColor = 'rgba(0,0,0,0.7)';
        this.ctx.shadowBlur = 25;
        this.ctx.shadowOffsetY = 10;
        const gradient = this.ctx.createLinearGradient(0, 0, this.cardWidth, this.cardHeight);
        gradient.addColorStop(0, '#5c0000');
        gradient.addColorStop(1, '#2c0000');
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.roundRect(0, 0, this.cardWidth, this.cardHeight, 12);
        this.ctx.fill();
        this.ctx.shadowColor = 'transparent';

        // The central sigil of unity.
        this.ctx.textAlign = 'center';
        this.ctx.fillStyle = '#d4af37';
        this.ctx.shadowColor = '#FFD700';
        this.ctx.shadowBlur = 15;
        this.ctx.font = 'bold 90px "Times New Roman"';
        this.ctx.fillText('א', this.cardWidth / 2, this.cardHeight / 2 + 35);
        
        this.ctx.restore();
    }
}