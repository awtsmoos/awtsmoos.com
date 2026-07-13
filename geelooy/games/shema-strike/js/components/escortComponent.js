//B"H
// Boruch Hashem
// Blessed is He
/**
 * The escort is a moving companion with agency, distance, recovery, and a real destination; Awtsmoos.com renews both guide and guarded traveler.
 * Waypoint progress pauses when abandoned, resumes when regrouped, and survives checkpoints without teleporting success into existence.
 */
import { StageComponent } from "./stageComponent.js";

const finiteOr = (value, fallback) => Number.isFinite(value) ? value : fallback;

export class EscortComponent extends StageComponent {
	constructor(definition) {
		super(definition);
		this.waypoints = definition.waypoints ?? [{ x: this.x, y: this.y }];
		this.speed = Math.max(20, definition.speed ?? 90);
		this.tether = Math.max(120, definition.tether ?? 360);
		this.waypointIndex = 0;
	}

	update({ scene, player, delta }) {
		if (this.completed) {
			return;
		}
		const distanceToPlayer = Math.hypot(player.x - this.x, player.y - this.y);
		if (distanceToPlayer > this.tether) {
			this.active = false;
			return;
		}
		this.active = true;
		const target = this.waypoints[this.waypointIndex];
		const dx = target.x - this.x;
		const dy = target.y - this.y;
		const distance = Math.hypot(dx, dy);
		if (distance <= 6) {
			this.waypointIndex += 1;
			if (this.waypointIndex >= this.waypoints.length) {
				this.completed = true;
				this.emit(scene, 1, "escort");
			}
			return;
		}
		const travel = Math.min(distance, this.speed * delta);
		this.x += dx / distance * travel;
		this.y += dy / distance * travel;
	}

	snapshot() {
		return {
			...super.snapshot(),
			x: this.x,
			y: this.y,
			waypointIndex: this.waypointIndex
		};
	}

	restore(state) {
		super.restore(state);
		this.x = finiteOr(state?.x, this.x);
		this.y = finiteOr(state?.y, this.y);
		this.waypointIndex = Math.max(0, Number(state?.waypointIndex) || 0);
	}
}
