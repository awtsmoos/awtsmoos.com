// B"H

class HealthPacket {
    // B"H - Added world to the constructor
    constructor(x, y, world) { 
        this.world = world;
        this.x = x;
        // B"H - THE FIX: Set Y position relative to the ground, not the screen
        this.y = this.world.canvas.height - this.world.groundHeight - 20; 

        this.size = 35;
        this.healAmount = 25;
        this.life = 600; // Lasts for 10 seconds
        this.bobAngle = Math.random() * Math.PI * 2;
    }

    getBoundingBox() {
        return {
            x: this.x - this.size / 2,
            y: this.y - this.size / 2,
            width: this.size,
            height: this.size
        };
    }

    update() {
        this.life--;
        this.bobAngle += 0.05;
    }

    draw(ctx) {
        const bobY = Math.sin(this.bobAngle) * 5;
        const currentY = this.y + bobY;
        
        // Pulsing glow effect
        const alpha = 0.6 + Math.sin(this.bobAngle * 2) * 0.4;

        ctx.save();
        
        if (this.life < 120 && Math.floor(this.life / 10) % 2 === 0) {
            // Blink when about to disappear
            ctx.globalAlpha = 0;
        } else {
             // Draw glow
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.font = `${this.size * 1.5}px Arial`;
            ctx.fillText("✨", this.x, currentY);
        }

        // Draw main emoji "Neshama" (Soul)
        ctx.font = `${this.size}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("נ", this.x, currentY);

        ctx.restore();
    }
}