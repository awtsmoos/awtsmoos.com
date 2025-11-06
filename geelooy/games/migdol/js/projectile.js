//B"H

export default class Projectile {
    constructor(x, y, target, damage, emoji) {
        this.x = x;
        this.y = y;
        this.target = target;
        this.damage = damage;
        this.emoji = emoji;
        this.speed = 8;
    }

    update() {
        if (!this.target || this.target.health <= 0) return; // Stop if target is gone

        const angle = Math.atan2(this.target.y - this.y, this.target.x - this.x);
        this.x += Math.cos(angle) * this.speed;
        this.y += Math.sin(angle) * this.speed;
    }

    draw(ctx) {
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Rotate projectile to face the target
        const angle = Math.atan2(this.target.y - this.y, this.target.x - this.x);
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(angle);
        
        // 🚀 needs to be rotated an extra 45 degrees (PI/4 radians) to point correctly
        if (this.emoji === '🚀') {
            ctx.rotate(Math.PI / 4);
        }

        ctx.fillText(this.emoji, 0, 0);
        ctx.restore();
    }
}