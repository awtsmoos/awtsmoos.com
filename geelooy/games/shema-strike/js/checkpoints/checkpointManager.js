//B"H
// Boruch Hashem
// Blessed is He
/**
 * A checkpoint remembers a lawful place of return while Awtsmoos.com recreates traveler, world, and remembered possibility.
 * Plain snapshots preserve entity condition, event truth, objective baselines, component state, and deterministic stage time.
 */
import { overlaps } from "../physics/geometry.js";
import {
	componentSnapshots,
	entityState,
	restoreEntities
} from "./checkpointSnapshot.js";

export class CheckpointManager {
	constructor(scene, player) {
		this.scene = scene;
		this.player = player;
		this.activeId = "";
	}

	update() {
		for (const checkpoint of this.scene.checkpoints) {
			if (checkpoint.id === this.activeId || !overlaps(this.player, checkpoint)) {
				continue;
			}
			this.activeId = checkpoint.id;
			this.scene.checkpoints.forEach((marker) => {
				marker.active = marker.id === checkpoint.id;
			});
			return this.capture(checkpoint.id);
		}
		return null;
	}

	capture(checkpointId) {
		return {
			stageNumber: this.scene.recipe.number,
			checkpointId,
			stageTime: this.scene.time,
			player: {
				x: this.player.x,
				y: this.player.y,
				health: Math.max(1, this.player.health)
			},
			activeEnemyIds: this.scene.enemies.map((enemy) => enemy.id).filter(Boolean),
			activePickupIds: this.scene.pickups.map((pickup) => pickup.id).filter(Boolean),
			enemyStates: this.scene.enemies.map(entityState),
			pickupStates: this.scene.pickups.map(entityState),
			counters: {
				defeated: this.scene.defeated,
				collected: this.scene.collected,
				collectedTags: { ...this.scene.collectedTags }
			},
			ledger: this.scene.ledger?.snapshot() ?? null,
			components: componentSnapshots(this.scene.components ?? []),
			objective: this.scene.objective.snapshot()
		};
	}

	restore(snapshot) {
		if (!snapshot || snapshot.stageNumber !== this.scene.recipe.number) {
			return false;
		}
		this.scene.time = Math.max(0, Number(snapshot.stageTime) || 0);
		this.scene.enemies = restoreEntities(this.scene.enemies, snapshot.enemyStates, snapshot.activeEnemyIds);
		this.scene.pickups = restoreEntities(this.scene.pickups, snapshot.pickupStates, snapshot.activePickupIds);
		this.scene.defeated = snapshot.counters?.defeated ?? 0;
		this.scene.collected = snapshot.counters?.collected ?? 0;
		this.scene.collectedTags = { ...(snapshot.counters?.collectedTags ?? {}) };
		this.scene.ledger?.restore(snapshot.ledger);
		for (const component of this.scene.components ?? []) {
			component.restore?.(snapshot.components?.[component.id]);
		}
		this.restorePlayer(snapshot.player);
		this.activeId = String(snapshot.checkpointId ?? "");
		this.scene.checkpoints.forEach((checkpoint) => {
			checkpoint.active = checkpoint.id === this.activeId;
		});
		this.scene.objective.restore(snapshot.objective);
		return true;
	}

	restorePlayer(playerState) {
		this.player.x = playerState?.x ?? this.scene.spawn.x;
		this.player.y = playerState?.y ?? this.scene.spawn.y;
		this.player.health = Math.max(1, Math.min(
			this.player.maxHealth,
			playerState?.health ?? this.player.maxHealth
		));
		this.player.vx = 0;
		this.player.vy = 0;
	}
}
