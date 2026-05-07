
/**
 * B"H
 * @class Human
 * @chapter The Mirror of the Tzelem
 * @description
 * Draws the human vessel. It dynamically shifts its geometry 
 * between Front, Back, and Side profiles to ensure the Tzaddik 
 * maintains their physical dignity in every dimension.
 */
export class Human {
    static draw(ctx, x, y, size, progress, dir) {
        ctx.save();
        ctx.translate(x + size / 2, y + size / 2);

        const isSide = dir === 'l' || dir === 'r';
        const phase = Math.sin(progress * Math.PI * 2);
        const bob = Math.abs(phase) * (size / 18);
        ctx.translate(0, -bob);

        const skin = '#ffdbac';
        const shirt = '#1565c0';
        const pants = '#1e2430';
        const swing = phase * (size / 4);

        // Order of Appearance (The Seder of Layers)
        
        // 1. BACK ARM (Hidden if side-view unless swinging)
        if (isSide) {
            ctx.globalAlpha = 0.5;
            this._drawArm(ctx, size, -swing, shirt, skin, dir === 'r', true);
            ctx.globalAlpha = 1.0;
        } else {
            this._drawArm(ctx, size, -swing, shirt, skin, false, false);
        }

        // 2. LEGS
        ctx.fillStyle = pants;
        if (isSide) {
            // Overlapping legs for profile
            ctx.fillRect(-size/10 + swing, size/8, size/6, size/3);
            ctx.globalAlpha = 0.6;
            ctx.fillRect(-size/10 - swing, size/8, size/6, size/3);
            ctx.globalAlpha = 1.0;
        } else {
            ctx.fillRect(-size/4, size/8, size/6, size/3 + (dir === 'd' ? swing : -swing));
            ctx.fillRect(size/10, size/8, size/6, size/3 + (dir === 'd' ? -swing : swing));
        }

        // 3. TORSO
        ctx.fillStyle = shirt;
        const torsoW = isSide ? size / 3 : size / 2;
        ctx.beginPath();
        ctx.roundRect(-torsoW / 2, -size / 4, torsoW, size / 2, size / 12);
        ctx.fill();

        // 4. FRONT ARM
        if (isSide) {
            this._drawArm(ctx, size, swing, shirt, skin, dir === 'l', true);
        } else {
            this._drawArm(ctx, size, swing, shirt, skin, true, false); // FIXED: isFlipped is now true!
        }

        // 5. HEAD
        this._drawHead(ctx, size, dir, skin);

        ctx.restore();
    }

    static _drawHead(ctx, size, dir, skin) {
        const hr = size / 5;
        const hy = -size / 2.5;
        const isSide = dir === 'l' || dir === 'r';

        ctx.fillStyle = skin;
        ctx.beginPath();
        // Slightly offset head in side view
        const hx = isSide ? (dir === 'l' ? -2 : 2) : 0;
        ctx.arc(hx, hy, hr, 0, Math.PI * 2);
        ctx.fill();

        // Kippah (The Crown)
        ctx.fillStyle = '#000';
        ctx.beginPath();
        const kw = isSide ? hr * 0.7 : hr * 0.8;
        ctx.ellipse(hx, hy - hr + 2, kw, hr * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Eyes (Panim)
        if (dir === 'd' || isSide) {
            ctx.fillStyle = '#000';
            const eyeX = isSide ? (dir === 'l' ? -hr/1.5 : hr/1.5) : hr/2.5;
            if (!isSide) {
                ctx.fillRect(-eyeX, hy, 2, 2);
                ctx.fillRect(eyeX - 2, hy, 2, 2);
            } else {
                ctx.fillRect(hx + (dir === 'l' ? -hr/2 : hr/2-2), hy, 2, 2);
            }
        }
    }

    static _drawArm(ctx, size, swing, shirt, skin, isFlipped, isSide) {
        ctx.save();
        
        // Side offset logic
        let side = isSide ? 0 : (isFlipped ? size / 3 : -size / 3);
        if (isSide) ctx.translate(swing, 0);

        ctx.lineWidth = size / 8;
        ctx.lineCap = 'round';
        
        // Sleeve
        ctx.strokeStyle = shirt;
        ctx.beginPath();
        ctx.moveTo(side, -size / 6);
        ctx.lineTo(side, size / 10 + (isSide ? 0 : swing));
        ctx.stroke();

        // Hand
        ctx.strokeStyle = skin;
        ctx.beginPath();
        ctx.moveTo(side, size / 10 + (isSide ? 0 : swing));
        ctx.lineTo(side, size / 6 + (isSide ? 0 : swing));
        ctx.stroke();
        
        ctx.restore();
    }
}
