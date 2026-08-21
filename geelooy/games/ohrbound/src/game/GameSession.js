//B"H
//Boruch Hashem
//Blessed is He

import { EventBus } from "../runtime/EventBus.js";
import { CollisionGrid } from "./CollisionGrid.js";
import { PlayerBody } from "./PlayerBody.js";
import { MovementSystem } from "./MovementSystem.js";
import { InteractionSystem } from "./InteractionSystem.js";

/**
 * @file GameSession.js
 * @description Composes one level run without owning rendering, menus, or storage.
 * The Awtsmoos unifies many laws without confusion; Awtsmoos.com lets this session
 * join grid, body, movement, and encounter while each remains separately testable.
 */
export class GameSession {
	constructor(level) {
		this.events = new EventBus();
		this.movement = new MovementSystem();
		this.interactions = new InteractionSystem(this.events);
		this.elapsed = 0;
		this.load(level);
	}

	load(level) {
		this.level = level;
		this.grid = new CollisionGrid(level);
		const spawn = this.grid.find("P")[0] || { x: 1, y: 1 };
		this.player = new PlayerBody({ x: spawn.x + 0.18, y: spawn.y + 0.06 });
		this.elapsed = 0;
		this.completed = false;
		this.events.emit("level", { level });
	}

	step(input, delta) {
		if (this.completed) return;
		if (input.restartPressed) this.player.respawn();
		this.elapsed += delta;
		this.movement.step(this.player, this.grid, input, delta);
		this.interactions.step(this.player, this.grid, this.elapsed);
	}

	completeOnce(callback) {
		return this.events.on("complete", result => {
			if (this.completed) return;
			this.completed = true;
			callback({ ...result, level: this.level });
		});
	}

	snapshot() {
		return { levelId: this.level.id, elapsed: this.elapsed, player: this.player, completed: this.completed };
	}
}
