// B"H

/**
 * A particle is a spark of the divine, a temporary manifestation of light and energy
 * that graces the world for a moment before returning to the infinite.
 */
class Particle {
    constructor(x, y, vx, vy, size, color, lifespan, type = 'rect', text = '') {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.size = size;
        this.color = color;
        this.lifespan = lifespan;
        this.initialLifespan = lifespan;
        this.type = type;
        this.text = text;
    }

    /**
     * The inexorable march of time, acting upon a single spark.
     */
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.05; // A whisper of gravity
        this.lifespan--;
    }

    /**
     * The command for the spark to manifest itself upon the canvas.
     * @param {CanvasRenderingContext2D} ctx The context of creation.
     */
    draw(ctx) {
        const alpha = this.lifespan / this.initialLifespan;
        ctx.globalAlpha = Math.max(0, alpha);

        if (this.type === 'text') {
            ctx.fillStyle = this.color;
            ctx.font = `${this.size}px Inter`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.text, this.x, this.y);
        } else {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
        }
        
        ctx.globalAlpha = 1.0;
    }
}

/**
 * Creates a small, bright spark, a fleeting moment of light for every impact.
 * @param {number} x The horizontal point of creation.
 * @param {number} y The vertical point of creation.
 * @returns {Particle} A newly born particle.
 */
export function createParticle(x, y) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 2 + 0.5;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;
    const size = Math.random() * 3 + 2;
    const color = `hsl(${Math.random() * 60 + 20}, 100%, 75%)`; // Yellow/orange sparks
    const lifespan = Math.random() * 30 + 30;
    return new Particle(x, y, vx, vy, size, color, lifespan);
}

const HEBREW_LETTERS = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ', 'ק', 'ר', 'ש', 'ת'];
const PARTICLE_COLORS = ['#22d3ee', '#34d399', '#facc15', '#f87171', '#a855f7'];

/**
 * Creates a glorious explosion of multi-colored Hebrew letters, a celebration
 * of a brick's return to the infinite.
 * @param {number} x The horizontal epicenter of the explosion.
 * @param {number} y The vertical epicenter of the explosion.
 * @returns {Particle[]} An array of holy letter-particles.
 */
export function createHebrewExplosion(x, y) {
    const particles = [];
    const count = 20;
    for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const speed = Math.random() * 3 + 1;
        const vx = Math.cos(angle) * speed + (Math.random() - 0.5);
        const vy = Math.sin(angle) * speed + (Math.random() - 0.5);
        const size = Math.random() * 10 + 12;
        const color = PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)];
        const lifespan = Math.random() * 40 + 50;
        const letter = HEBREW_LETTERS[Math.floor(Math.random() * HEBREW_LETTERS.length)];
        particles.push(new Particle(x, y, vx, vy, size, color, lifespan, 'text', letter));
    }
    return particles;
}
