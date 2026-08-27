// B"H

/**
 * This module is the divine artist responsible for painting the cosmos.
 * It creates a deep, parallaxing starfield that gives the illusion of journeying
 * through an infinite, star-strewn void, a backdrop for the sacred game.
 */

// A single point of light in the infinite void.
class Star {
    constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

// A vast, colorful cloud of cosmic dust.
class Nebula {
    constructor(x, y, radius, color1, color2) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color1 = color1; // Inner color
        this.color2 = color2; // Outer color (transparent)
    }

    draw(ctx) {
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
        gradient.addColorStop(0, this.color1);
        gradient.addColorStop(1, this.color2);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }
}

// A collection of stars moving at a unified speed, a celestial current.
class Layer {
    constructor(width, height, speed, entities, type) {
        this.width = width;
        this.height = height;
        this.speed = speed;
        this.entities = entities;
        this.type = type;
    }

    update(scrollAmount) {
        const delta = scrollAmount * this.speed;
        for (const entity of this.entities) {
            entity.y -= delta;
            // Wrap entities from top to bottom for an infinite scroll
            if (entity.y + entity.radius < 0) {
                entity.y = this.height + entity.radius;
                if (this.type === 'stars') {
                   entity.x = Math.random() * this.width;
                }
            }
        }
    }

    draw(ctx) {
        for (const entity of this.entities) {
            entity.draw(ctx);
        }
    }
    
    resize(width, height) {
        this.width = width;
        this.height = height;
        this.entities.forEach(entity => {
            entity.x *= width / this.width;
            entity.y *= height / this.height;
        });
    }
}

// The master painter of the entire cosmos.
export class Background {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        
        this.layers = this.createLayers();
    }
    
    createLayers() {
        const nebulae = [];
        for(let i=0; i < 3; i++) {
            nebulae.push(new Nebula(
                Math.random() * this.width * 1.5 - (this.width * 0.25),
                Math.random() * this.height,
                Math.random() * (this.width / 2) + (this.width / 3),
                `hsla(${Math.random() * 360}, 50%, 20%, 0.3)`, // Inner color
                `hsla(${Math.random() * 360}, 50%, 20%, 0)`    // Outer transparent
            ));
        }

        const stars1 = [];
        for (let i = 0; i < 100; i++) {
            stars1.push(new Star(Math.random() * this.width, Math.random() * this.height, Math.random() * 1.5 + 0.5, `rgba(255, 255, 255, ${Math.random() * 0.5 + 0.3})`));
        }
        const stars2 = [];
        for (let i = 0; i < 50; i++) {
            stars2.push(new Star(Math.random() * this.width, Math.random() * this.height, Math.random() * 2 + 1, `rgba(255, 255, 255, ${Math.random() * 0.6 + 0.4})`));
        }
        const stars3 = [];
        for (let i = 0; i < 25; i++) {
            stars3.push(new Star(Math.random() * this.width, Math.random() * this.height, Math.random() * 2.5 + 1.5, `rgba(255, 255, 255, ${Math.random() * 0.7 + 0.5})`));
        }

        return [
            new Layer(this.width, this.height, 0.1, nebulae, 'nebulae'),     // Deepest space, slowest
            new Layer(this.width, this.height, 0.2, stars1, 'stars'),
            new Layer(this.width, this.height, 0.4, stars2, 'stars'),
            new Layer(this.width, this.height, 0.6, stars3, 'stars'),    // Nearest space, fastest
        ];
    }
    
    /**
     * The command to the cosmos to adapt to a new reality (canvas size).
     * @param {number} width The new width of existence.
     * @param {number} height The new height of existence.
     */
    resize(width, height) {
        this.width = width;
        this.height = height;
        // Recreate layers on resize to get a good distribution
        this.layers = this.createLayers();
    }

    /**
     * The command for the heavens to advance in their celestial journey.
     * @param {number} scrollAmount The distance the foreground has moved.
     */
    update(scrollAmount) {
        for (const layer of this.layers) {
            layer.update(scrollAmount);
        }
    }

    /**
     * The command for the entire cosmos to manifest upon the canvas.
     * @param {CanvasRenderingContext2D} ctx The context of creation.
     */
    draw(ctx) {
        // Draw nebulae with a soft blending mode
        ctx.globalCompositeOperation = 'lighter';
        this.layers[0].draw(ctx); // Assuming nebulae are always the first layer
        ctx.globalCompositeOperation = 'source-over';
        
        // Draw stars normally
        for (let i = 1; i < this.layers.length; i++) {
            this.layers[i].draw(ctx);
        }
    }
}