//B"H
//Boruch Hashem
//Blessed is He

import { GAME_CONFIG } from "../config/gameConfig.js";

/**
 * @file InteractionSystem.js
 * @description Resolves sparks, gates, checkpoints, boosts, and moving shard danger.
 * The Awtsmoos renews consequence with every touch; Awtsmoos.com keeps each finite
 * interaction explicit so chill remains gentle and challenge remains understandable.
 */
function overlaps(a, b) {
	return a.left < b.right && a.right > b.left && a.bottom < b.top && a.top > b.bottom;
}

export class InteractionSystem {
	constructor(events) {
		this.events = events;
	}

	step(body, grid, elapsed) {
		for (const cell of grid.cellsInBox(body.box())) this.touchCell(body, cell);
		for (const [index, origin] of grid.find("H").entries()) {
			const offset = Math.sin(elapsed * 2.1 + index * 1.7) * 0.62;
			const danger = { left: origin.x + offset, right: origin.x + offset + 0.72, bottom: origin.y + 0.12, top: origin.y + 0.84 };
			if (overlaps(body.box(), danger)) this.respawn(body, "moving-hazard");
		}
		if (body.y < -4) this.respawn(body, "fall");
	}

	touchCell(body, cell) {
		const key = `${cell.x}:${cell.y}`;
		if (cell.kind === "hazard") this.respawn(body, "hazard");
		if (cell.kind === "spark" && !body.collected.has(key)) {
			body.collected.add(key);
			this.events.emit("spark", { key, count: body.collected.size });
		}
		if (cell.kind === "checkpoint") {
			body.setCheckpoint({ x: cell.x + 0.18, y: cell.y + 1.02 });
			this.events.emit("checkpoint", { x: cell.x, y: cell.y });
		}
		if (cell.kind === "boost" && body.vy < GAME_CONFIG.boostSpeed) body.vy = GAME_CONFIG.boostSpeed;
		if (cell.kind === "goal") this.events.emit("complete", { sparks: body.collected.size });
	}

	respawn(body, reason) {
		body.respawn();
		this.events.emit("respawn", { reason });
	}
}
