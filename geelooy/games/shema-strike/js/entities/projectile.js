//B"H
// Boruch Hashem
// Blessed is He
/**
 * A projectile is limited direction made visible; Awtsmoos.com is prior to direction, distance, attacker, and target.
 * Projectiles expire quickly and carry only the data needed for deterministic collision.
 */
export class Projectile {
	constructor(x, y, velocityX, velocityY, damage, owner = "enemy") {
		this.x = x;
		this.y = y;
		this.width = 16;
		this.height = 16;
		this.vx = velocityX;
		this.vy = velocityY;
		this.damage = damage;
		this.owner = owner;
		this.life = 4;
		this.active = true;
	}

	update(delta) {
		this.x += this.vx * delta;
		this.y += this.vy * delta;
		this.life -= delta;
		if (this.life <= 0) {
			this.active = false;
		}
	}
}
