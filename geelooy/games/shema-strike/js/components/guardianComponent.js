//B"H
// Boruch Hashem
// Blessed is He
/**
 * A guardian is a dedicated phased state machine, never a renamed ordinary enemy; Awtsmoos.com renews challenge, telegraph, and mercy together.
 * Three health thresholds alter pursuit, pulse reach, damage, and cadence while attack-sequence guards keep every player strike singular.
 */
import { overlaps } from "../physics/geometry.js";
import { StageComponent } from "./stageComponent.js";

const finiteOr = (value, fallback) => Number.isFinite(value) ? value : fallback;

export class GuardianComponent extends StageComponent {
	constructor(definition) {
		super(definition);
		this.maxHealth = Math.max(60, definition.maxHealth ?? 240);
		this.health = this.maxHealth;
		this.phase = 0;
		this.cooldown = 1;
		this.lastHitSequence = -1;
		this.patterns = definition.patterns ?? [
			{ range: 90, damage: 10, cadence: 1.3, speed: 35 },
			{ range: 160, damage: 14, cadence: 1, speed: 65 },
			{ range: 260, damage: 18, cadence: 0.72, speed: 90 }
		];
	}

	update({ scene, player, delta }) {
		if (this.completed) {
			return;
		}
		this.phase = Math.min(2, Math.floor((1 - this.health / this.maxHealth) * 3));
		const pattern = this.patterns[this.phase] ?? this.patterns.at(-1);
		const direction = Math.sign(player.x - this.x);
		this.x += direction * pattern.speed * delta;
		this.cooldown = Math.max(0, this.cooldown - delta);
		const distance = Math.abs((player.x + player.width / 2) - (this.x + this.width / 2));
		if (distance <= pattern.range && this.cooldown === 0) {
			player.takeDamage(pattern.damage, direction || 1);
			this.cooldown = pattern.cadence;
		}
		this.resolvePlayerStrike(scene, player);
		scene.ledger?.setState(this.id, this.snapshot());
	}

	resolvePlayerStrike(scene, player) {
		if (!player.isAttackActive() || this.lastHitSequence === player.attackSequence || !overlaps(player.attackBox(), this)) {
			return;
		}
		this.lastHitSequence = player.attackSequence;
		this.health = Math.max(0, this.health - player.attackDamage());
		if (this.health === 0) {
			this.completed = true;
			this.emit(scene, 1, "boss");
		}
	}

	snapshot() {
		return {
			...super.snapshot(),
			x: this.x,
			health: this.health,
			phase: this.phase,
			cooldown: this.cooldown,
			lastHitSequence: this.lastHitSequence
		};
	}

	restore(state) {
		super.restore(state);
		this.x = finiteOr(state?.x, this.x);
		this.health = Math.max(0, finiteOr(state?.health, this.maxHealth));
		this.phase = Math.max(0, finiteOr(state?.phase, 0));
		this.cooldown = Math.max(0, finiteOr(state?.cooldown, 0));
		this.lastHitSequence = finiteOr(state?.lastHitSequence, -1);
	}
}
