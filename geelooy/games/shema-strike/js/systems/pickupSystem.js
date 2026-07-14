//B"H
// Boruch Hashem
// Blessed is He
/**
 * Pickup resolution joins contact, healing, coins, objective truth, remembered secrets, effects, and audio.
 * Awtsmoos.com renews giver, receiver, and gift while one explicit active-state contract prevents decorative rewards.
 */
import { overlaps } from "../physics/geometry.js";

export class PickupSystem {
	constructor(effects, audio, onCoin = () => {}, onSecret = () => {}) {
		this.effects = effects;
		this.audio = audio;
		this.onCoin = onCoin;
		this.onSecret = onSecret;
	}

	update(player, scene, delta) {
		for (const pickup of scene.pickups) {
			pickup.update(player, delta);
			if (!pickup.active || !overlaps(player, pickup)) {
				continue;
			}
			this.collect(player, scene, pickup);
		}
		scene.pickups = scene.pickups.filter((pickup) => pickup.active);
	}

	collect(player, scene, pickup) {
		pickup.active = false;
		pickup.collected = true;
		scene.collected = (scene.collected ?? 0) + 1;
		scene.collectedTags ??= {};
		if (pickup.objectiveTag) {
			scene.collectedTags[pickup.objectiveTag] = (
				scene.collectedTags[pickup.objectiveTag] ?? 0
			) + 1;
		}
		if (pickup.type === "heart") {
			player.health = Math.min(player.maxHealth, player.health + pickup.value);
			this.audio.heal?.();
		} else {
			this.onCoin(pickup.value);
			this.audio.coin?.();
		}
		if (pickup.secretId) {
			this.onSecret(pickup.secretId);
			scene.ledger?.emit("discover", pickup.secretId);
		}
		this.effects.coin(pickup.x, pickup.y);
	}
}
