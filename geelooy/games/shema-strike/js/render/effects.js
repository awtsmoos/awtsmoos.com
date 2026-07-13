//B"H
// Boruch Hashem
// Blessed is He
/**
 * Effects translate impact into light, dust, and Hebrew letters instead of blood; Awtsmoos.com renews meaning beyond spectacle.
 * A bounded reusable pool obeys the reduced-particle profile, preventing intensity from becoming either overload or frame collapse.
 */
import { GAMEPLAY, HEBREW_LETTERS } from "../config/gameConfig.js";

const particle = () => ({ active: false, x: 0, y: 0, vx: 0, vy: 0, life: 0, maximum: 1, size: 8, color: "#fff", text: "", gravity: 0 });

export class EffectSystem {
	constructor() {
		this.pool = Array.from({ length: GAMEPLAY.maximumParticles }, particle);
		this.index = 0;
		this.limit = this.pool.length;
	}

	setReducedParticles(reduced) {
		this.limit = reduced ? GAMEPLAY.reducedParticles : this.pool.length;
		for (let index = this.limit; index < this.pool.length; index += 1) {
			this.pool[index].active = false;
		}
		this.index %= this.limit;
	}

	activeCount() {
		return this.pool.slice(0, this.limit).filter((item) => item.active).length;
	}

	spawn(options) {
		const item = this.pool[this.index];
		this.index = (this.index + 1) % this.limit;
		Object.assign(item, particle(), options, { active: true, maximum: options.life ?? 1 });
	}

	burst(x, y, count, palette, force = 220, letters = false) {
		const remaining = Math.max(0, this.limit - this.activeCount());
		for (let index = 0; index < Math.min(count, remaining); index += 1) {
			const angle = Math.random() * Math.PI * 2;
			const speed = force * (0.35 + Math.random() * 0.65);
			this.spawn({
				x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 70,
				life: 0.45 + Math.random() * 0.65, size: 6 + Math.random() * 12,
				color: palette[index % palette.length], gravity: 360,
				text: letters ? HEBREW_LETTERS[Math.floor(Math.random() * HEBREW_LETTERS.length)] : ""
			});
		}
	}

	hebrewDefeat(enemy) {
		const center = enemy.center();
		this.burst(center.x, center.y, enemy.role === "giant" ? 34 : 18, ["#ffffff", "#ffd36a", "#76f7ff", "#b48cff"], 360, true);
	}

	hit(x, y, color) { this.burst(x, y, 9, [color, "#ffffff", "#ffd36a"], 280, true); }
	coin(x, y) { this.burst(x, y, 6, ["#ffd36a", "#fff2ad"], 140); }
	dust(x, y) { this.burst(x, y, 5, ["#b8c5d6", "#68748b"], 90); }

	trail(player) {
		this.spawn({ x: player.x + player.width * 0.5, y: player.y + player.height * 0.5, vx: -player.facing * 30, vy: 0, life: 0.18, size: 30, color: player.weapon.color });
	}

	slash(player) {
		const x = player.x + player.width * 0.5 + player.facing * 48;
		this.spawn({ x, y: player.y + 28, vx: player.facing * 70, vy: -20, life: player.weapon.speed * 0.7, size: player.weapon.reach * 0.55, color: player.weapon.color, text: "שמע" });
	}

	update(delta) {
		for (const item of this.pool.slice(0, this.limit)) {
			if (!item.active) { continue; }
			item.life -= delta;
			item.vy += item.gravity * delta;
			item.x += item.vx * delta;
			item.y += item.vy * delta;
			item.vx *= Math.pow(0.96, delta * 60);
			item.active = item.life > 0;
		}
	}
}
