//B"H
//Boruch Hashem
//Blessed is He

/**
 * A tiny playable vessel: the Awtsmoos creates the traveler and meadow anew
 * each frame, while movement reveals that even a step is sustained from above.
 */
import { EmergencyBounds, EmergencyOctree } from "./EmergencyOctree.js";

const MOVEMENT_KEYS = new Set(["KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"]);

export class EmergencyMeadowWorld {
	constructor() {
		this.player = { x: 0, z: 4, heading: 0, moving: false };
		this.keys = new Set();
		this.obstacles = this.createObstacles();
		this.octree = new EmergencyOctree(new EmergencyBounds(0, 0, 0, 64, 8, 64));
		for (const obstacle of this.obstacles) {
			this.octree.insert(obstacle);
		}
	}

	setKey(code, active) {
		if (!MOVEMENT_KEYS.has(code)) {
			return false;
		}
		active ? this.keys.add(code) : this.keys.delete(code);
		return true;
	}

	update(deltaSeconds) {
		let xAxis = Number(this.keys.has("KeyD") || this.keys.has("ArrowRight"))
			- Number(this.keys.has("KeyA") || this.keys.has("ArrowLeft"));
		let zAxis = Number(this.keys.has("KeyS") || this.keys.has("ArrowDown"))
			- Number(this.keys.has("KeyW") || this.keys.has("ArrowUp"));
		const length = Math.hypot(xAxis, zAxis) || 1;
		xAxis /= length;
		zAxis /= length;
		this.player.moving = Boolean(xAxis || zAxis);
		if (!this.player.moving) {
			return;
		}
		this.player.heading = Math.atan2(xAxis, zAxis);
		const distance = 7 * deltaSeconds;
		this.tryAxis("x", xAxis * distance);
		this.tryAxis("z", zAxis * distance);
	}

	tryAxis(axis, amount) {
		if (!amount) {
			return;
		}
		const nextX = this.player.x + (axis === "x" ? amount : 0);
		const nextZ = this.player.z + (axis === "z" ? amount : 0);
		const bounds = new EmergencyBounds(nextX, 1, nextZ, 0.55, 1, 0.55);
		if (!this.octree.query(bounds).length && Math.abs(nextX) < 42 && Math.abs(nextZ) < 42) {
			this.player.x = nextX;
			this.player.z = nextZ;
		}
	}

	createObstacles() {
		const specifications = [
			[-8, -2, 1.6, 1.4, "rock"],
			[7, -7, 1.8, 1.8, "tree"],
			[11, 5, 1.5, 1.5, "rock"],
			[-13, 9, 2, 2, "tree"],
			[2, 14, 1.7, 1.7, "tree"]
		];
		return specifications.map(([x, z, halfX, halfZ, kind], index) => ({
			id: `obstacle-${index}`,
			kind,
			bounds: new EmergencyBounds(x, 1, z, halfX, 2, halfZ)
		}));
	}
}
