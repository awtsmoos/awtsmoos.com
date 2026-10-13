// B"H

import { convertToGematria } from "../gematria.js";
import { paintGlossBlock } from "../../../scripts/player-shell/fx/game-textures.js";

const BRICK_COLORS = {
  1: '#22d3ee',   // Cyan
  10: '#34d399',  // Emerald
  25: '#a3e635',  // Lime
  50: '#facc15',  // Yellow
  100: '#fb923c', // Orange
  200: '#f87171', // Red
};

/**
 * The Awtsmoos imbues all creation with properties, a unique essence. For bricks, this essence
 * is color, derived from their resilience (health).
 */
function getBrickColor(health) {
    const thresholds = Object.keys(BRICK_COLORS).map(Number).sort((a, b) => b - a);
    for (const threshold of thresholds) {
        if (health >= threshold) {
            return BRICK_COLORS[threshold];
        }
    }
    return BRICK_COLORS[1];
}

/**
 * A brick's life force, when vast, must be expressed with grace and brevity.
 * This function formats large numbers into a more compact form (K for thousands, M for millions).
 * @param {number} health The absolute life force.
 * @returns {string} The formatted representation of that life force.
 */
function formatHealth(health) {
    if (health < 10000) {
        return health.toString();
    } else if (health < 1000000) {
        return Math.floor(health / 1000) + 'K';
    } else {
        return (health / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
}

/**
 * A Brick is a fundamental building block of our created world.
 * It is not merely data, but an entity with its own existence, form, and motion.
 */
export class Brick {
    constructor(x, y, width, height, health, targetY, type = 'normal') {
        this.x = x;
        this.y = y;
        this.targetY = targetY; // For animation
        this.width = width;
        this.height = height;
        this.health = health;
        this.type = type; // 'normal' | 'bomb' | 'portal_a' | 'portal_b' | 'prism'
        this.color = getBrickColor(health);
        
        // Brick Type Styling
        if (this.type === 'bomb') {
            this.color = '#ef4444'; // Bright Red/Danger
        } else if (this.type === 'portal_a') {
             this.color = '#3b82f6'; // Blue Portal
        } else if (this.type === 'portal_b') {
             this.color = '#f97316'; // Orange Portal
        } else if (this.type === 'prism') {
             this.color = '#a855f7'; // Purple Crystal
        }
    }
    
    /**
     * A brick's journey from the heavens to its place in the world.
     * This allows for the graceful slide-in animation.
     */
    update() {
        // Simple easing for smooth animation
        if (Math.abs(this.targetY - this.y) > 0.1) {
            this.y += (this.targetY - this.y) * 0.1;
        } else {
            this.y = this.targetY;
        }
    }

    /**
     * As a brick's life force wanes, its outer form changes to reflect its inner state.
     */
    updateColor() {
        if (this.type !== 'normal') return;
        this.color = getBrickColor(this.health);
    }
    
    /**
     * The command to a brick to manifest itself upon the canvas, the fabric of reality.
     * @param {CanvasRenderingContext2D} ctx The context of creation.
     */
    draw(ctx) {
        if (this.type.startsWith('portal')) {
            this.drawPortal(ctx);
            return;
        }
        if (this.type === 'prism') {
            this.drawPrism(ctx);
            return;
        }
        
        // B"H glossy brick: gradient + top gloss + speckle, no flat colors.
        paintGlossBlock(ctx, this.x, this.y, this.width, brickTones(this.color), { h: this.height, radius: 4, seed: Math.round(this.x + this.y) });

        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;

        if (this.type === 'bomb') {
            // B"H drawn bomb: iron sphere, highlight, fuse, live spark.
            const br = Math.min(this.width, this.height) * 0.22;
            ctx.save();
            ctx.translate(centerX, centerY - 4);
            const bg = ctx.createRadialGradient(-br * 0.3, -br * 0.35, br * 0.1, 0, 0, br);
            bg.addColorStop(0, '#6a7280');
            bg.addColorStop(0.6, '#2a2e38');
            bg.addColorStop(1, '#101218');
            ctx.fillStyle = bg;
            ctx.beginPath(); ctx.arc(0, 0, br, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = 'rgba(255,255,255,0.55)';
            ctx.beginPath(); ctx.arc(-br * 0.32, -br * 0.36, br * 0.22, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = '#8a6a3a';
            ctx.lineWidth = 3;
            ctx.beginPath(); ctx.moveTo(br * 0.4, -br * 0.75); ctx.quadraticCurveTo(br * 0.9, -br * 1.4, br * 0.5, -br * 1.7); ctx.stroke();
            const flick = 2 + Math.sin(Date.now() / 90) * 1.2;
            ctx.fillStyle = '#ffd75e';
            ctx.shadowColor = '#ff9a2e'; ctx.shadowBlur = 10;
            ctx.beginPath(); ctx.arc(br * 0.5, -br * 1.7, flick + 1.5, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
            ctx.font = 'bold 10px Inter';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = 'white';
            ctx.fillText(formatHealth(this.health), centerX, centerY + 14);
        } else {
            const formattedHealth = formatHealth(this.health);
            const hebrew = convertToGematria(this.health);

            // --- Common style for both inscriptions ---
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 4; 

            // --- Draw Health Number with Outline ---
            const healthFontSize = formattedHealth.length > 4 ? 18 : 24;
            ctx.font = `bold ${healthFontSize}px Inter`;
            ctx.strokeText(formattedHealth, centerX, centerY - 8); 
            ctx.fillStyle = 'white';
            ctx.fillText(formattedHealth, centerX, centerY - 8);   
            
            // --- Draw Gematria with Outline ---
            ctx.font = 'bold 18px Inter';
            ctx.strokeText(hebrew, centerX, centerY + 11); 
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.fillText(hebrew, centerX, centerY + 11);   
        }
    }
    
    drawPortal(ctx) {
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        
        const time = Date.now() / 500;
        const gradient = ctx.createConicGradient(time, centerX, centerY);
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(0.5, 'black');
        gradient.addColorStop(1, this.color);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, this.width/2 - 2, this.height/2 - 2, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 3;
        ctx.stroke();
    }
    
    drawPrism(ctx) {
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        const size = Math.min(this.width, this.height) / 2;
        
        ctx.fillStyle = 'rgba(168, 85, 247, 0.2)'; // Transparent purple
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 3;
        
        // Draw Triangle
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - size + 4);
        ctx.lineTo(centerX + size, centerY + size - 4);
        ctx.lineTo(centerX - size, centerY + size - 4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Inner core: drawn lightning bolt
        ctx.save();
        ctx.translate(centerX, centerY + 2);
        ctx.shadowColor = '#f5d97e'; ctx.shadowBlur = 12;
        ctx.fillStyle = '#ffe9a8';
        const bs = size * 0.42;
        ctx.beginPath();
        ctx.moveTo(bs * 0.15, -bs);
        ctx.lineTo(-bs * 0.35, bs * 0.15);
        ctx.lineTo(-bs * 0.02, bs * 0.15);
        ctx.lineTo(-bs * 0.15, bs);
        ctx.lineTo(bs * 0.35, -bs * 0.15);
        ctx.lineTo(bs * 0.02, -bs * 0.15);
        ctx.closePath(); ctx.fill();
        ctx.restore();
    }
}

/** Derive hi/base/dark tones from a brick hex color. */
function brickTones(hex) {
	const shade = (h, amt) => {
		const n = parseInt(h.slice(1), 16);
		const f = (c) => Math.max(0, Math.min(255, Math.round(c + amt)));
		const r = f((n >> 16) & 255), g = f((n >> 8) & 255), b = f(n & 255);
		return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
	};
	return { hi: shade(hex, 60), base: hex, dark: shade(hex, -60) };
}
