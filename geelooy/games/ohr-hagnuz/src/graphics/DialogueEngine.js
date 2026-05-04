
import { Understanding } from '../binah/Understanding.js';

/**
 * B"H
 * DialogueEngine: The Messenger of the Hidden Light.
 * 
 * Chapter: The Instantaneous Word.
 * In the world of Atzilut, thought and action are one. 
 * Below, in Asiyah, there is a delay—the typewriter effect. 
 * But the Will (Ratzon) has the power to bridge the gap.
 * By pressing the sacred Space, the user commands the letters 
 * to skip the process of 'becoming' and 'be' all at once.
 * 
 * @class DialogueEngine
 */
export class DialogueEngine {
    /** @type {boolean} Is the speech window currently manifest? */
    static isVisible = false;
    
    /** @type {string} The full string currently being revealed. */
    static currentText = "";
    
    /** @type {string} The portion of the string currently visible to the eyes. */
    static displayedText = "";
    
    /** @type {string[]} The remaining utterances waiting in the queue. */
    static queue = [];
    
    /** @type {number} The current letter index being processed. */
    static charIndex = 0;
    
    /** @type {number} The timestamp of the last character revealed. */
    static lastCharTime = 0;
    
    /** @type {number} Normal speed of revelation (ms per char). */
    static baseSpeed = 30; 
    
    /** @type {number} Accelerated speed when the soul is in a hurry. */
    static fastSpeed = 5; 

    /**
     * Speak a series of lines into the world.
     * @param {string[]} lines An array of strings to be manifested sequentially.
     */
    static speak(lines) {
        this.queue = [...lines];
        this.loadNextLine();
        this.isVisible = true;
    }

    /**
     * Logic for advancing the dialogue.
     * First press: Complete the current line instantly.
     * Second press: Move to the next line or close.
     */
    static advance() {
        if (!this.isVisible) return;

        // If we are still typing, jump to the end of the current utterance
        if (this.charIndex < this.currentText.length) {
            this.charIndex = this.currentText.length;
            this.displayedText = this.currentText;
            return;
        }

        // If the line is already complete, try to load the next one
        if (this.queue.length > 0) {
            this.loadNextLine();
        } else {
            this.close();
        }
    }

    /**
     * Internal helper to set up the next line from the queue.
     */
    static loadNextLine() {
        if (this.queue.length > 0) {
            this.currentText = this.queue.shift();
            this.displayedText = "";
            this.charIndex = 0;
            this.lastCharTime = performance.now();
        }
    }

    /**
     * Dissolve the dialogue vessel back into the potential.
     */
    static close() {
        this.isVisible = false;
        this.currentText = "";
        this.displayedText = "";
        this.charIndex = 0;
        
        const state = Understanding.state;
        // Return the NPC to their original orientation
        if (state.activeInteractingEntity) {
            state.activeInteractingEntity.dir = state.activeInteractingEntity.originalDir;
            state.activeInteractingEntity = null;
        }
    }

    /**
     * The pulse of the typewriter.
     * @param {number} now Current timestamp in the Seder Histalshelus.
     * @param {boolean} isFast Is the user holding the acceleration key?
     */
    static update(now, isFast = false) {
        if (!this.isVisible || this.charIndex >= this.currentText.length) return;

        const currentSpeed = isFast ? this.fastSpeed : this.baseSpeed;

        if (now - this.lastCharTime > currentSpeed) {
            this.displayedText += this.currentText[this.charIndex];
            this.charIndex++;
            this.lastCharTime = now;
        }
    }

    /**
     * Reveal the dialogue on the physical canvas.
     * @param {CanvasRenderingContext2D} ctx The pen of the Creator.
     */
    static draw(ctx) {
        if (!this.isVisible) return;
        const { width: w, height: h } = ctx.canvas;
        const boxH = 160;
        const boxW = Math.min(w - 40, 800);
        const boxX = (w - boxW) / 2;
        const boxY = h - boxH - 20;

        ctx.save();
        // The Vessel (White background, black border)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.98)';
        ctx.shadowColor = 'rgba(0,0,0,0.4)';
        ctx.shadowBlur = 30;
        ctx.beginPath();
        ctx.roundRect(boxX, boxY, boxW, boxH, 20);
        ctx.fill();
        ctx.strokeStyle = '#222';
        ctx.lineWidth = 5;
        ctx.stroke();
        
        // The Text (Ink of the scribe)
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#111';
        ctx.font = '600 24px "Segoe UI", Tahoma, sans-serif';
        ctx.textBaseline = 'top';
        const lines = this.wrapText(ctx, this.displayedText, boxW - 60);
        lines.forEach((line, i) => {
            ctx.fillText(line, boxX + 30, boxY + 30 + i * 35);
        });

        // The Pulsing Cursor (Indicates readiness for the next level)
        if (this.charIndex >= this.currentText.length) {
            ctx.fillStyle = '#1565c0';
            const ty = boxY + boxH - 30 + Math.sin(performance.now() / 150) * 5;
            ctx.beginPath();
            ctx.moveTo(boxX + boxW - 45, ty);
            ctx.lineTo(boxX + boxW - 25, ty);
            ctx.lineTo(boxX + boxW - 35, ty + 12);
            ctx.fill();
        }
        ctx.restore();
    }

    /**
     * Splits text to fit the vessel's width.
     * @param {CanvasRenderingContext2D} ctx 
     * @param {string} text 
     * @param {number} maxWidth 
     * @returns {string[]}
     */
    static wrapText(ctx, text, maxWidth) {
        const words = text.split(' ');
        const lines = [];
        let currentLine = '';
        words.forEach(word => {
            if (ctx.measureText(currentLine + word).width > maxWidth) {
                lines.push(currentLine);
                currentLine = word + ' ';
            } else {
                currentLine += word + ' ';
            }
        });
        lines.push(currentLine);
        return lines;
    }
}
