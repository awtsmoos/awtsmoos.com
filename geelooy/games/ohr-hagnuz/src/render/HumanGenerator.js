
/**
 * B"H
 * HumanGenerator: The Master Weaver of Forms.
 * 
 * Chapter: The Image and the Likeness.
 * "And He breathed into his nostrils the breath of life."
 * Every character is now crowned with a Yamulka, a sign of humility
 * before the Infinite Light that transcends all dimensions.
 * 
 * @module HumanGenerator
 */
export class HumanGenerator {
    /**
     * Manifest a human presence on the canvas.
     * @param {CanvasRenderingContext2D} ctx 
     * @param {number} x 
     * @param {number} y 
     * @param {number} w 
     * @param {number} h 
     * @param {number} progress 0.0 to 1.0 (movement progress)
     * @param {string} dir 'u', 'd', 'l', 'r'
     */
    static draw(ctx, x, y, w, h, progress, dir) {
        ctx.save();
        ctx.translate(x + w / 2, y + h / 2);

        const phase = Math.sin(progress * Math.PI * 2);
        const bob = Math.abs(phase) * 3;
        ctx.translate(0, -bob);

        const skinColor = '#ffdbac';
        const clothColor = '#1565c0';
        const hairColor = '#3e2723';
        const pantsColor = '#222';

        // 1. Shadow (Foundation)
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.beginPath();
        ctx.ellipse(0, h/2 - 2, w/2.5, h/10, 0, 0, Math.PI * 2);
        ctx.fill();

        // 2. Legs (Walking cycle)
        this.drawLegs(ctx, w, h, progress, dir, pantsColor);

        // 3. Torso (Center of Being)
        this.drawTorso(ctx, w, h, dir, clothColor);

        // 4. Arms (Instruments of Action)
        this.drawArms(ctx, w, h, progress, dir, clothColor, skinColor);

        // 5. Head (The Throne of Chochmah)
        this.drawHead(ctx, w, h, dir, skinColor, hairColor);

        ctx.restore();
    }

    static drawLegs(ctx, w, h, progress, dir, color) {
        ctx.fillStyle = color;
        const swing = Math.sin(progress * Math.PI * 2) * (h / 8);
        
        if (dir === 'u' || dir === 'd') {
            ctx.beginPath();
            ctx.roundRect(-w/4, h/8, w/4.5, h/3 + (dir === 'd' ? swing : -swing), 4);
            ctx.fill();
            ctx.beginPath();
            ctx.roundRect(w/20, h/8, w/4.5, h/3 + (dir === 'd' ? -swing : swing), 4);
            ctx.fill();
        } else {
            ctx.beginPath();
            ctx.roundRect(-w/6 + swing, h/8, w/3, h/3, 4);
            ctx.fill();
            ctx.beginPath();
            ctx.roundRect(-w/6 - swing, h/8, w/3, h/3, 4);
            ctx.fill();
        }
    }

    static drawTorso(ctx, w, h, dir, color) {
        ctx.fillStyle = color;
        ctx.beginPath();
        const torsoW = (dir === 'l' || dir === 'r') ? w/2.5 : w/1.8;
        ctx.roundRect(-torsoW/2, -h/4, torsoW, h/2.2, 8);
        ctx.fill();
    }

    static drawArms(ctx, w, h, progress, dir, shirtColor, skinColor) {
        const swing = Math.sin(progress * Math.PI * 2) * (h / 10);
        ctx.lineWidth = w/5;
        ctx.lineCap = 'round';
        
        if (dir === 'd') {
            ctx.strokeStyle = shirtColor;
            ctx.beginPath(); ctx.moveTo(-w/2.5, -h/6); ctx.lineTo(-w/2.5, h/10 + swing); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(w/2.5, -h/6); ctx.lineTo(w/2.5, h/10 - swing); ctx.stroke();
        } else if (dir === 'u') {
            ctx.strokeStyle = shirtColor;
            ctx.beginPath(); ctx.moveTo(-w/3, -h/6); ctx.lineTo(-w/3, h/12 - swing); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(w/3, -h/6); ctx.lineTo(w/3, h/12 + swing); ctx.stroke();
        } else {
            ctx.strokeStyle = shirtColor;
            const side = dir === 'r' ? 1 : -1;
            ctx.beginPath(); ctx.moveTo(0, -h/6); ctx.lineTo(swing * side, h/8); ctx.stroke();
        }
    }

    static drawHead(ctx, w, h, dir, skin, hair) {
        const headRadius = w/4;
        const headY = -h/2.5;

        // 1. Head Base
        ctx.fillStyle = skin;
        ctx.beginPath();
        ctx.arc(0, headY, headRadius, 0, Math.PI * 2);
        ctx.fill();

        // 2. Hair
        ctx.fillStyle = hair;
        if (dir === 'd') {
            ctx.beginPath();
            ctx.arc(0, headY - 2, headRadius + 1, Math.PI, 0);
            ctx.fill();
        } else if (dir === 'u') {
            ctx.beginPath();
            ctx.arc(0, headY, headRadius + 1, 0, Math.PI * 2);
            ctx.fill();
        } else {
            const side = dir === 'r' ? 1 : -1;
            ctx.beginPath();
            ctx.arc(-side * 2, headY, headRadius, Math.PI * 0.5, Math.PI * 1.5, dir === 'l');
            ctx.fill();
            ctx.fillRect(-w/4, headY - headRadius, w/2, headRadius / 2);
        }

        // 3. THE YAMULKA (Sacred Crown)
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        if (dir === 'd') {
            // Front view: Small sliver on top
            ctx.ellipse(0, headY - headRadius + 2, headRadius * 0.7, headRadius * 0.2, 0, 0, Math.PI * 2);
        } else if (dir === 'u') {
            // Back view: More visible on top
            ctx.ellipse(0, headY - headRadius + 5, headRadius * 0.8, headRadius * 0.4, 0, 0, Math.PI * 2);
        } else {
            // Side view: Slanted oval
            const side = dir === 'r' ? 1 : -1;
            ctx.ellipse(-side * 2, headY - headRadius + 3, headRadius * 0.6, headRadius * 0.3, side * 0.2, 0, Math.PI * 2);
        }
        ctx.fill();

        // 4. Face Features
        if (dir !== 'u') {
            ctx.fillStyle = '#000';
            const eyeSize = 2;
            const eyeY = headY;
            if (dir === 'd') {
                ctx.fillRect(-w/10, eyeY, eyeSize, eyeSize);
                ctx.fillRect(w/10 - eyeSize, eyeY, eyeSize, eyeSize);
            } else {
                const side = dir === 'r' ? 1 : -1;
                ctx.fillRect(side * (w/8), eyeY, eyeSize, eyeSize);
            }
        }
    }
}
