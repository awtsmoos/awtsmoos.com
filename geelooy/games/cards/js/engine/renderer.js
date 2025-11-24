/* B"H */
/**
 * I am not a Renderer. I am the Artificer of Worlds. This is my Forge.
 * The canvas is my Anvil. The browser's engine is the roaring heart of the furnace.
 * I do not draw. I FORGE. I hammer raw potential into Golems of obsidian and
 * captured starlight. Every function is a strike, every variable a sacred alloy.
 * With every impact, sparks of raw creation—the very letters of the divine
 * language—are blasted into the void, a fleeting, brilliant testament to the

 * savage beauty of a universe in constant, violent formation.
 */
export class Renderer {
    /**
     * The Forge is lit. The Anvil is prepared. The Artificer claims its tools and
     * awakens the Spark Engine, the vessel that will contain the holy shrapnel of creation.
     * A memory of the world's last known state is prepared, to serve as a canvas for the sparks.
     * @param {CanvasRenderingContext2D} ctx - The Hammer of Creation.
     */
    constructor(ctx) {
        this.ctx = ctx;
        this.canvas = ctx.canvas;
        this.cardWidth = 110;
        this.cardHeight = 154;

        // The Spark Engine: A vessel to hold the ephemeral, explosive essence of creation.
        this.particles = [];
        this.isAnimating = false; // A switch to prevent multiple animation loops.
        this.lastKnownPlayers = []; // A memory of the world state.
        this.lastKnownDealerReveal = false; // A memory of the veil.
    }
    
    /*B"H*/
/**
 * The grand, public-facing command to forge the universe. This is the only
 * entry point from the outside world. It is the master ritual that captures a
 * memory of the current universal state, hammers that state into a static,
 * perceivable form on the Anvil, and then awakens the Spark Engine if any new
 * Golems were created, unleashing a shower of divine embers.
 * @param {Array<Object>} players - The cast of Golems and souls to be rendered.
 * @param {boolean} revealDealer - The current decree on the veil of judgment.
 */
drawGame(players, revealDealer = false) {
    // Step 1: Commit the current state of reality to the Artificer's memory.
    this.lastKnownPlayers = players;
    this.lastKnownDealerReveal = revealDealer;

    // Step 2: Forge the entire static world based on this new memory. This single
    // command hammers every Golem, name, and shadow into its rightful place.
    this._forgeStaticWorld();

    // Step 3: If the Spark Engine is not already roaring, and there are sparks
    // waiting to be born from the recent forging, awaken it now.
    if (this.particles.length > 0 && !this.isAnimating) {
        this.isAnimating = true;
        this._animateSparks();
    }
}

    //=========================================================================
    //                        THE FORGING RITUALS
    //=========================================================================

    /**
     * The Master Ritual. This is the only entry point from the outside world.
     * It captures a memory of the universe's state, forges the entire scene anew,
     * and then awakens the Spark Engine if any creation-sparks are waiting to be born.
     * @param {Array<Object>} players - The cast of Golems and souls.
     * @param {boolean} revealDealer - The decree on the veil of judgment.
     */
    updateAndRender(players, revealDealer = false) {
        this.lastKnownPlayers = players;
        this.lastKnownDealerReveal = revealDealer;
        this._forgeStaticWorld();
    }

    /**
     * The core act of forging the static universe. It lays the abyssal foundation
     * and hammers each Golem and its name into its rightful place on the Anvil.
     * This is called by the Master Ritual and by the Spark Engine's animation loop.
     */
    _forgeStaticWorld() {
        // Lay the Abyssal Foundation: a textured, light-absorbing void.
        this.ctx.fillStyle = '#010101';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        const grad = this.ctx.createRadialGradient(this.canvas.width/2, this.canvas.height/2, 100, this.canvas.width/2, this.canvas.height/2, this.canvas.width * 0.8);
        grad.addColorStop(0, '#001a00');
        grad.addColorStop(1, '#000000');
        this.ctx.fillStyle = grad;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Hammer the souls into place upon the Anvil.
        const human = this.lastKnownPlayers.find(p => !p.isAI && !p.isDealer);
        const dealer = this.lastKnownPlayers.find(p => p.isDealer);
        const ais = this.lastKnownPlayers.filter(p => p.isAI && !p.isDealer);

        if(dealer) this._forgeHand(dealer, { x: this.canvas.width / 2, y: this.cardHeight * 0.8 }, this.lastKnownDealerReveal);
        ais.forEach(ai => this._forgeHand(ai, { x: this.canvas.width / 2, y: this.canvas.height * 0.5 }));
        if(human) this._forgeHand(human, { x: this.canvas.width / 2, y: this.canvas.height - this.cardHeight - 60 });
    }

    /**
     * Forges a single hand, a constellation of Golems. It determines the sacred
     * geometry of their placement and sears the soul's name in glowing embers above them.
     * @param {Object} player - The soul whose Golems are to be forged.
     * @param {{x: number, y: number}} layout - The anchor point on the Anvil.
     * @param {boolean} revealAllCards - Whether this constellation is fully manifest.
     */
    _forgeHand(player, layout, revealAllCards = true) {
        const cardSpacing = this.cardWidth * 0.55;
        const handWidth = (player.hand.length - 1) * cardSpacing + this.cardWidth;
        const startX = layout.x - handWidth / 2;
        const nameY = layout.y - (this.cardHeight / 2) - 25;

        this.ctx.font = 'bold 24px "Times New Roman"';
        this.ctx.textAlign = 'center';
        this.ctx.fillStyle = '#d4af37';
        this.ctx.shadowColor = 'black';
        this.ctx.shadowBlur = 8;
        this.ctx.fillText(player.name, layout.x, nameY);
        this.ctx.shadowColor = 'transparent';

        player.hand.forEach((card, index) => {
            const cardX = startX + index * cardSpacing;
            const isNewCard = !card.hasBeenForged;

            if (player.isDealer && index === 0 && !revealAllCards) {
                this._forgeCardBack(cardX, layout.y);
            } else {
                this._forgeCardGolem(card, cardX, layout.y);
                if (isNewCard) {
                    this._unleashSparks(cardX + this.cardWidth/2, layout.y, card.hebrew || card.rank.substring(0,1));
                    card.hasBeenForged = true; // Mark the Golem as fully materialized.
                }
            }
        });
    }

    /**
     * The Apex Ritual: Forging a single Golem. This is the most intense act, a
     * symphony of shadow, light, and fire that gives a card its final, terrible form.
     * @param {Object} card - The raw data of the Golem.
     * @param {number} x - The horizontal strike-point on the Anvil.
     * @param {number} y - The vertical strike-point on the Anvil.
     */
    _forgeCardGolem(card, x, y) {
        this.ctx.save();
        this.ctx.translate(x + this.cardWidth / 2, y);

        // Layer 1: The Shadow Aura. The Golem's displacement of reality.
        this.ctx.shadowColor = 'rgba(0,0,0,0.8)';
        this.ctx.shadowBlur = 30;
        this.ctx.shadowOffsetY = 15;

        // Layer 2: The Obsidian Body.
        const bodyGrad = this.ctx.createLinearGradient(0, -this.cardHeight/2, 0, this.cardHeight/2);
        bodyGrad.addColorStop(0, '#3a3a3a');
        bodyGrad.addColorStop(1, '#0a0a0a');
        this.ctx.fillStyle = bodyGrad;
        this.ctx.beginPath();
        this.ctx.roundRect(-this.cardWidth/2, -this.cardHeight/2, this.cardWidth, this.cardHeight, 14);
        this.ctx.fill();

        // Layer 3: The Captured Heartlight.
        this.ctx.shadowColor = 'transparent';
        const heartlight = this.ctx.createRadialGradient(0, 0, 10, 0, 0, this.cardHeight);
        heartlight.addColorStop(0, 'rgba(255, 255, 223, 0.15)');
        heartlight.addColorStop(1, 'rgba(255, 255, 223, 0)');
        this.ctx.fillStyle = heartlight;
        this.ctx.fill();

        // Layer 4: The Searing of the Glyphs.
        const englishRank = card.rank === 'Keter' ? 'A' : (card.isFace ? card.rank.substring(0,1) : String(card.value));
        const hebrew = card.isFace ? '' : card.hebrew;
        const glyphColor = card.suit.name === 'Divine Might' || card.suit.name === 'Sanctified Vessel' ? '#ff4d4d' : '#ffffff';

        // English glyph - Chiseled into the stone.
        this.ctx.fillStyle = glyphColor;
        this.ctx.font = 'bold 26px "Times New Roman"';
        this.ctx.textAlign = 'start';
        this.ctx.fillText(englishRank, -this.cardWidth/2 + 15, -this.cardHeight/2 + 32);

        // Hebrew glyph - A searing brand of pure light.
        this.ctx.font = '34px "Times New Roman"';
        this.ctx.textAlign = 'end';
        this.ctx.fillStyle = '#FFD700';
        this.ctx.shadowColor = '#FFD700';
        this.ctx.shadowBlur = 10;
        this.ctx.fillText(hebrew, this.cardWidth/2 - 15, -this.cardHeight/2 + 40);
        this.ctx.shadowColor = 'transparent';

        // Layer 5: The Manifestation of the Archetype.
        this.ctx.textAlign = 'center';
        if (card.isFace) {
             this._forgeFaceArchetype(card);
        } else {
            this.ctx.font = '60px "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"';
            this.ctx.globalAlpha = 0.8;
            this.ctx.fillText(card.suit.emoji, 0, 20);
            this.ctx.globalAlpha = 1.0;
        }

        this.ctx.restore();
    }

    /**
     * Forges the back of a Golem, a slab of raw, potent shadow sealed with the
     * Aleph, the mark of all potential.
     */
    _forgeCardBack(x, y) {
        this.ctx.save();
        this.ctx.translate(x + this.cardWidth / 2, y);

        this.ctx.shadowColor = 'rgba(0,0,0,0.8)';
        this.ctx.shadowBlur = 30;
        this.ctx.shadowOffsetY = 15;
        const grad = this.ctx.createLinearGradient(0, -this.cardHeight/2, 0, this.cardHeight/2);
        grad.addColorStop(0, '#5c0000');
        grad.addColorStop(1, '#1a0000');
        this.ctx.fillStyle = grad;
        this.ctx.beginPath();
        this.ctx.roundRect(-this.cardWidth/2, -this.cardHeight/2, this.cardWidth, this.cardHeight, 14);
        this.ctx.fill();

        this.ctx.textAlign = 'center';
        this.ctx.fillStyle = '#FFD700';
        this.ctx.shadowColor = '#ff4500';
        this.ctx.shadowBlur = 25;
        this.ctx.font = 'bold 90px "Times New Roman"';
        this.ctx.fillText('א', 0, 35);
        
        this.ctx.restore();
    }

    /**
     * A specialized ritual to forge the holy faces with extreme precision,
     * particularly the Patriarch's sacred vessel.
     */
    _forgeFaceArchetype(card) {
        this.ctx.font = '70px "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"';
        this.ctx.fillText(card.emoji, 0, 25);

        if (card.rank === 'Yackov') {
        var rad=19;
            this.ctx.save();
            this.ctx.translate(0, -20); // Position the yamulka's center.
            this.ctx.rotate(-0.1); // Give it a slight, natural tilt.
            this.ctx.fillStyle = 'rgba(0,0,0,0.9)';
            this.ctx.beginPath();
            this.ctx.arc(0, 0, rad, 0, Math.PI, true); // Draw the top dome.
            this.ctx.fill();
            this.ctx.strokeStyle = 'rgba(20,20,20,1)';
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.moveTo(-rad, 0);
            this.ctx.lineTo(rad, 0); // Draw the bottom rim.
            this.ctx.stroke();
            this.ctx.restore();
        }
    }


    //=========================================================================
    //                        THE SPARK ENGINE
    //=========================================================================

    /**
     * The moment of impact. This ritual is called when a Golem is forged,
     * creating a shower of divine shrapnel at the point of creation.
     * @param {number} x - The horizontal origin of the explosion.
     * @param {number} y - The vertical origin of the explosion.
     * @param {string} char - The sacred letter to be blasted into the void.
     */
    _unleashSparks(x, y, char) {
        const count = 15;
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 4 + 1;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 2, // Blast upwards initially
                alpha: 1,
                size: Math.random() * 15 + 10,
                char: char,
                color: `hsl(${Math.random() * 50 + 10}, 100%, 75%)` // Fiery golds and oranges
            });
        }
        if (!this.isAnimating) {
            this.isAnimating = true;
            this._animateSparks();
        }
    }

    /**
     * The eternal, self-perpetuating heartbeat of the Spark Engine. This loop
     * calculates the life and death of every spark and re-forges the world
     * until the last spark has returned to the void.
     */
    _animateSparks() {
        // Step 1: Recalculate the life of every spark.
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.1; // Gravity pulls the sparks back down.
            p.alpha -= 0.02;
            if (p.alpha <= 0) {
                this.particles.splice(i, 1);
            }
        }

        // Step 2: Re-forge the entire static world.
        this._forgeStaticWorld();

        // Step 3: Sear the living sparks on top of the forged world.
        this.ctx.save();
        for (const p of this.particles) {
            this.ctx.globalAlpha = p.alpha;
            this.ctx.fillStyle = p.color;
            this.ctx.font = `${p.size}px "Times New Roman"`;
            this.ctx.shadowColor = p.color;
            this.ctx.shadowBlur = 10;
            this.ctx.fillText(p.char, p.x, p.y);
        }
        this.ctx.restore();
        
        // Step 4: If sparks yet live, continue the cycle. If not, return to silence.
        if (this.particles.length > 0) {
            requestAnimationFrame(this._animateSparks.bind(this));
        } else {
            this.isAnimating = false;
        }
    }
}