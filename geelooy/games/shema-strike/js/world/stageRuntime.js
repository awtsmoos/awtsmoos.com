//B"H
// Boruch Hashem
// Blessed is He
/**
 * Runtime orders moving vessels while Awtsmoos.com renews the scene before any update claims priority.
 * Components act before objective judgment, and checkpoints preserve their exact state without owning campaign persistence.
 */
import { CheckpointManager } from "../checkpoints/checkpointManager.js";
import { ObjectiveController } from "../objectives/objectiveController.js";
import { overlaps } from "../physics/geometry.js";

export class StageRuntime {
	constructor(scene, player, systems, checkpointSnapshot = null) {
		this.scene = scene;
		this.player = player;
		this.combat = systems.combat;
		this.pickups = systems.pickups;
		this.effects = systems.effects;
		this.preferences = systems.preferences ?? {};
		this.scene.objective = new ObjectiveController(scene.objectiveDefinition);
		this.checkpoints = new CheckpointManager(scene, player);
		if (checkpointSnapshot) {
			this.checkpoints.restore(checkpointSnapshot);
		}
		this.updateObjective();
	}

	update(input, delta) {
		const scene = this.scene;
		input.beginFrame?.();
		scene.time += delta;
		this.updateBodies();
		this.player.update(input, scene, delta, this.effects);
		this.updateEnemies(delta);
		this.updateProjectiles(delta);
		this.combat.update(this.player, scene);
		this.pickups.update(this.player, scene, delta);
		this.updateComponents(input, delta);
		this.effects.update(delta);
		const objective = this.updateObjective();
		const checkpoint = this.checkpoints.update();
		return {
			defeated: this.player.health <= 0,
			completed: scene.portal.active && overlaps(this.player, scene.portal),
			checkpoint,
			objective
		};
	}

	updateBodies() {
		for (const body of this.scene.bodies) {
			body.update(this.scene.time);
		}
	}

	updateEnemies(delta) {
		for (const enemy of this.scene.enemies) {
			enemy.update(this.player, this.scene, delta);
		}
	}

	updateProjectiles(delta) {
		for (const projectile of this.scene.projectiles) {
			projectile.update(delta);
		}
		this.scene.projectiles = this.scene.projectiles.filter((projectile) => (
			projectile.active
			&& projectile.x > -100
			&& projectile.x < this.scene.width + 100
		));
	}

	updateComponents(input, delta) {
		for (const component of this.scene.components ?? []) {
			component.update({
				scene: this.scene, player: this.player, input, delta, preferences: this.preferences
			});
		}
	}

	updateObjective() {
		const status = this.scene.objective.update(this.scene, this.player);
		this.scene.objectiveStatus = status;
		this.scene.portal.active = status.complete;
		return status;
	}
}
