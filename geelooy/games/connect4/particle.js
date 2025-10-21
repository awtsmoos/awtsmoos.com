//B"H

// A base class for all particles to inherit from.
class BaseParticle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        // More powerful, outward explosion force
        this.speedX = (Math.random() - 0.5) * 18;
        this.speedY = (Math.random() - 0.7) * 22; // Biased upwards
        this.alpha = 1.0;
        this.gravity = 0.5;
        // Particles fade out at different rates
        this.decay = Math.random() * 0.01 + 0.02;
    }

    update() {
        this.speedY += this.gravity;
        this.x += this.speedX;
        this.y += this.speedY;
        this.alpha -= this.decay;
        if (this.alpha < 0) {
            this.alpha = 0;
        }
    }

    draw(ctx) {
        // This method is meant to be overridden by child classes
        throw new Error("Draw method must be implemented by a subclass.");
    }
}

// Sharp, triangular "shard" particles that rotate as they fly.
class Shard extends BaseParticle {
    constructor(x, y, color) {
        super(x, y, color);
        this.size = Math.random() * 16 + 8;
        this.angle = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.4;
    }

    update() {
        super.update();
        // Add rotation
        this.angle += this.rotationSpeed;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        
        // Translate and rotate canvas for the particle
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        // Draw a solid, sharp triangle
        ctx.beginPath();
        ctx.moveTo(0, -this.size);
        ctx.lineTo(this.size / 2, this.size / 2);
        ctx.lineTo(-this.size / 2, this.size / 2);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }
}

// Fast-moving, short-lived lightning bolts for a flash effect.
class LightningBolt extends BaseParticle {
    constructor(x, y, color) {
        super(x, y, color);
        this.segments = [];
        this.lifetime = 12; // Lives for a very short time (12 frames)
        const maxRadius = Math.random() * 90 + 50;

        let currentPos = { x: 0, y: 0 };
        let angle = Math.random() * Math.PI * 2;
        
        // Create a jagged line path with 4-6 segments
        const numSegments = Math.floor(Math.random() * 3) + 4;
        for (let i = 0; i < numSegments; i++) {
             const radius = Math.random() * maxRadius / numSegments;
             angle += (Math.random() - 0.5) * 1.8; // More erratic angle changes
             currentPos.x += Math.cos(angle) * radius;
             currentPos.y += Math.sin(angle) * radius;
             this.segments.push({ ...currentPos });
        }
    }

    update() {
       // This particle's lifetime is not based on physics but a simple timer
       this.lifetime--;
       if(this.lifetime <= 0) {
           this.alpha = 0; // Mark for deletion
       } else {
           // Fade out very quickly
           this.alpha = (this.lifetime / 12);
       }
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = Math.random() * 3 + 1.5; // Solid, but varied thickness
        
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        // Draw the pre-calculated jagged segments
        this.segments.forEach(seg => {
            ctx.lineTo(this.x + seg.x, this.y + seg.y);
        });
        ctx.stroke();
        
        ctx.restore();
    }
}