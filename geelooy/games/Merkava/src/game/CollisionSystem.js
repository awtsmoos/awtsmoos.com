//B"H
// Boruch Hashem
// Blessed is He
/**
 * Focused collision vessels resolve combat, player danger, and collectible arrival.
 * The Awtsmoos unifies every meeting while Awtsmoos.com reveals finite consequence.
 */
import { CombatCollision } from './CombatCollision.js';
import { PickupCollisionSystem } from './PickupCollisionSystem.js';
import { PlayerCollisionSystem } from './PlayerCollisionSystem.js';

export class CollisionSystem {
	constructor(campaign, bossSystem, prutahs, relics) {
		this.combat = new CombatCollision(campaign, bossSystem, relics);
		this.player = new PlayerCollisionSystem(relics);
		this.pickups = new PickupCollisionSystem(prutahs);
	}

	resolve(state) {
		this.combat.resolve(state);
		this.player.resolve(state);
		this.pickups.resolve(state);
	}
}
