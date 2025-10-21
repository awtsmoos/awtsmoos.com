//B"H

// A highly-optimized base class for all particles.
class BaseParticle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        // Increased velocity for a more powerful, "super fast" explosion
        this.speedX = (Math.random() - 0.5) * 24;
        this.speedY = (Math.random() - 0.75) * 26; // Strong upward bias
        this.alpha = 1.0;
        this.gravity = 0.6; // Slightly stronger gravity for a snappier feel
        // Faster decay rate so particles disappear quickly, preventing buildup
        this.decay = Math.random() * 0.02 + 0.03;
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

    // The 'draw' method must be implemented by child classes.
}

// Sharp, triangular "shard" particles that rotate.
class Shard extends BaseParticle {
    constructor(x, y, color) {
        super(x, y, color);
        this.size = Math.random() * 18 + 10; // Slightly larger for more impact
        this.angle = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.5;
    }

    update() {
        super.update();
        this.angle += this.rotationSpeed;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        ctx.beginPath();
        ctx.moveTo(0, -this.size);
        ctx.lineTo(this.size / 2, this.size / 2);
        ctx.lineTo(-this.size / 2, this.size / 2);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }
}

// NEW: A high-performance particle for rendering Hebrew letters.
class HebrewLetter extends BaseParticle {
    constructor(x, y, color, char) {
        super(x, y, color);
        this.char = char;
        this.size = Math.random() * 25 + 15; // Prominent letter sizes
        this.angle = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.4;
    }

    update() {
        super.update();
        this.angle += this.rotationSpeed;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.font = `bold ${this.size}px Arial`;
        
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        // Drawing text is a very fast canvas operation.
        ctx.fillText(this.char, 0, 0);
        
        ctx.restore();
    }
}


// Short-lived lightning bolts for a flash effect.
class LightningBolt extends BaseParticle {
    constructor(x, y, color) {
        super(x, y, color);
        this.segments = [];
        this.lifetime = 10; // Lives for a very short time (10 frames)
        const maxRadius = Math.random() * 100 + 60;

        let currentPos = { x: 0, y: 0 };
        let angle = Math.random() * Math.PI * 2;
        
        const numSegments = Math.floor(Math.random() * 3) + 4;
        for (let i = 0; i < numSegments; i++) {
             const radius = Math.random() * maxRadius / numSegments;
             angle += (Math.random() - 0.5) * 1.8;
             currentPos.x += Math.cos(angle) * radius;
             currentPos.y += Math.sin(angle) * radius;
             this.segments.push({ ...currentPos });
        }
    }

    update() {
       this.lifetime--;
       if(this.lifetime <= 0) {
           this.alpha = 0;
       } else {
           this.alpha = (this.lifetime / 10);
       }
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = Math.random() * 3 + 2;
        
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        this.segments.forEach(seg => {
            ctx.lineTo(this.x + seg.x, this.y + seg.y);
        });
        ctx.stroke();
        
        ctx.restore();
    }
}