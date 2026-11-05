// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CourseEngine.js
 * @description Per-player obstacle-course run state: timer, ordered checkpoints,
 * respawn, movers with carry physics, substepped anti-tunneling, rotating
 * hazards, coins, surface friction, and best times. Runtime-agnostic: it only
 * reads and writes the player object handed to it each frame, so the
 * multiplayer bridge keeps replicating every avatar untouched.
 * The Awtsmoos counts every runner's own race without confusing one traveler
 * with another.
 */

import { validateCourse } from './courseSchema.js';
import { frictionFor } from './surfaceFriction.js';
import {
	moverBoxAt,
	sweeperAngleAt
} from './moverMath.js';
import {
	applyCarry,
	PLAYER_RADIUS,
	pushOutOfBox,
	resolveSweptMover,
	STEP_UP_LIMIT
} from './sweptCollision.js';

const COIN_PICKUP_RADIUS = 1.3;
const CHECKPOINT_Y_TOLERANCE = 2.5;
const HAZARD_INVULN_SECONDS = 1.2;
const MAX_FRAME_DT = 0.25;
const REGION_SLACK = 5;

function finite(value, fallback = 0) {
	const n = Number(value);
	return Number.isFinite(n) ? n : fallback;
}

function horizontalDistance(ax, az, bx, bz) {
	return Math.hypot(ax - bx, az - bz);
}

/** Static platform box (top-anchored authoring) at rest. */
export function staticPlatformBox(platform) {
	const thickness = finite(platform.thickness, 1);
	const top = finite(platform.top);
	const halfW = finite(platform.w, 1) / 2;
	const halfD = finite(platform.d, 1) / 2;
	return {
		minX: finite(platform.x) - halfW,
		maxX: finite(platform.x) + halfW,
		minY: top - thickness,
		maxY: top,
		minZ: finite(platform.z) - halfD,
		maxZ: finite(platform.z) + halfD
	};
}

function nullStorage() {
	return {
		getItem() { return null; },
		setItem() {}
	};
}

function resolveStorage(options) {
	if (options && options.storage) return options.storage;
	try {
		const storage = globalThis.localStorage;
		if (storage && typeof storage.getItem === 'function') return storage;
	} catch (error) { /* storage unavailable */ }
	return nullStorage();
}

export class CourseEngine {
	constructor(def, options = {}) {
		const receipt = validateCourse(def);
		if (!receipt.valid) {
			throw new Error(`Invalid course definition: ${receipt.errors.join('; ')}`);
		}
		this.def = def;
		this.storage = resolveStorage(options);
		this.onEvent = null;
		this.onFrameVisuals = null;
		this.active = false;
		this.courseTime = 0;
		this.running = false;
		this.finished = false;
		this.paused = false;
		this.checkpointIndex = 0;
		this.coinsCollected = 0;
		this.respawnCount = 0;
		this.bestMs = this.loadBestMs();
		this.collectedCoins = new Set();
		this.movers = def.movers.map(mover => ({
			def: mover,
			boxPrev: moverBoxAt(mover, 0),
			boxNow: moverBoxAt(mover, 0)
		}));
		this.lastGroundSurface = 'grass';
		this.lastGroundId = null;
	}

	bestKey() {
		return `mitzvahWorld.courseBest.${this.def.id}`;
	}

	loadBestMs() {
		try {
			const raw = this.storage.getItem(this.bestKey());
			const ms = Number(raw);
			return Number.isFinite(ms) && ms > 0 ? ms : null;
		} catch (error) {
			return null;
		}
	}

	saveBestMs(ms) {
		try {
			this.storage.setItem(this.bestKey(), String(Math.round(ms)));
		} catch (error) { /* best-effort */ }
	}

	/** Teleports the player to the course spawn and starts the run clock. */
	activate(player) {
		this.active = true;
		this.courseTime = 0;
		this.running = true;
		this.finished = false;
		this.paused = false;
		this.checkpointIndex = 0;
		this.coinsCollected = 0;
		this.respawnCount = 0;
		this.collectedCoins = new Set();
		for (const mover of this.movers) {
			mover.boxPrev = moverBoxAt(mover.def, 0);
			mover.boxNow = moverBoxAt(mover.def, 0);
		}
		this.placeAtSpawn(player);
		this.emit('start', { courseId: this.def.id });
	}

	deactivate() {
		this.active = false;
		this.running = false;
	}

	placeAtSpawn(player) {
		const spawn = this.def.spawn;
		player.x = finite(spawn.x);
		player.z = finite(spawn.z);
		player.y = finite(spawn.y);
		player.renderY = finite(spawn.y);
		player.velY = 0;
		player.grounded = true;
		player.facing = finite(spawn.facing);
		player.courseInvulnUntil = 0;
	}

	lastCheckpoint() {
		if (this.checkpointIndex === 0) {
			const spawn = this.def.spawn;
			return { x: finite(spawn.x), z: finite(spawn.z), y: finite(spawn.y) };
		}
		const cp = this.def.checkpoints[this.checkpointIndex - 1];
		return { x: finite(cp.x), z: finite(cp.z), y: finite(cp.y, finite(this.def.spawn.y)) };
	}

	/** Synchronous respawn at the last checkpoint — far under the 250ms budget. */
	respawn(player, reason) {
		const point = this.lastCheckpoint();
		player.x = point.x;
		player.z = point.z;
		player.y = point.y;
		player.renderY = point.y;
		player.velY = 0;
		player.grounded = true;
		player.courseInvulnUntil = this.courseTime + HAZARD_INVULN_SECONDS;
		this.respawnCount += 1;
		this.emit('respawn', { reason, checkpointIndex: this.checkpointIndex });
	}

	restart(player) {
		this.activate(player);
		this.emit('restart', { courseId: this.def.id });
	}

	emit(type, data) {
		try {
			this.onEvent?.(type, data || {});
		} catch (error) { /* HUD must never break physics */ }
	}

	inRegion(x, z, slack = 0) {
		const region = this.def.region;
		return x >= region.minX - slack && x <= region.maxX + slack
			&& z >= region.minZ - slack && z <= region.maxZ + slack;
	}

	/**
	 * Ground support receipt for the course, or null when the course has no
	 * say at (x, z). The step-up limit keeps players from snapping up through
	 * a platform from below; falling players land because previousY is high.
	 */
	groundReceipt(x, z, currentY, previousY) {
		if (!this.active || !this.inRegion(x, z)) return null;
		const ceiling = Math.max(finite(currentY), finite(previousY)) + STEP_UP_LIMIT;
		let best = null;
		const consider = (top, surface, kind, platformId) => {
			if (!(top <= ceiling)) return;
			if (best && top <= best.height) return;
			best = { height: top, profileId: surface, kind, platformId };
		};
		for (let i = 0; i < this.def.platforms.length; i++) {
			const platform = this.def.platforms[i];
			if (platform.visualOnly) continue;
			const box = staticPlatformBox(platform);
			if (x < box.minX - 0.02 || x > box.maxX + 0.02) continue;
			if (z < box.minZ - 0.02 || z > box.maxZ + 0.02) continue;
			consider(box.maxY, platform.surface, 'course-platform', `platform:${i}`);
		}
		for (const mover of this.movers) {
			const box = mover.boxNow;
			if (x < box.minX - 0.02 || x > box.maxX + 0.02) continue;
			if (z < box.minZ - 0.02 || z > box.maxZ + 0.02) continue;
			consider(box.maxY, mover.def.surface, 'course-mover', `mover:${mover.def.id}`);
		}
		return best;
	}

	/**
	 * Runs before the player's movement frame: advances movers, carries
	 * standing players, and resolves swept mover push-out plus static
	 * side-collision so nothing tunnels.
	 */
	beforePlayerFrame(player, dt) {
		if (!this.active) return;
		const step = Math.max(0, Math.min(MAX_FRAME_DT, finite(dt)));
		const tPrev = this.courseTime;
		const tNow = this.courseTime; // movers advance with the frame below
		for (const mover of this.movers) {
			mover.boxPrev = mover.boxNow;
		}
		// Movers advance even while paused visually? No — freeze with the run.
		const advanced = this.paused || !this.running ? tPrev : tPrev + step;
		for (const mover of this.movers) {
			mover.boxNow = moverBoxAt(mover.def, advanced);
		}
		// Carry first: standing players ride the delta.
		const carried = new Set();
		for (const mover of this.movers) {
			if (applyCarry(player, mover.boxPrev, mover.boxNow)) {
				carried.add(mover.def.id);
			}
		}
		// Swept push-out for every mover the player is not riding.
		for (const mover of this.movers) {
			if (carried.has(mover.def.id)) continue;
			resolveSweptMover(player, mover.boxPrev, mover.boxNow);
		}
		// Static side-collision: never walk through a platform wall.
		for (let i = 0; i < this.def.platforms.length; i++) {
			const platform = this.def.platforms[i];
			if (platform.visualOnly) continue;
			pushOutOfBox(player, staticPlatformBox(platform));
		}
		if (!this.paused && this.running && !this.finished) {
			this.courseTime = advanced;
		}
	}

	/**
	 * Runs after the player's movement frame: timer, friction, checkpoints,
	 * coins, hazards, kill plane, finish.
	 */
	afterPlayerFrame(player, dt) {
		if (!this.active) return;
		const step = Math.max(0, Math.min(MAX_FRAME_DT, finite(dt)));
		const feetY = finite(player.y, finite(player.renderY));
		// Surface friction from the live ground receipt.
		const receipt = this.groundReceipt(player.x, player.z, feetY, feetY);
		if (receipt) {
			this.lastGroundSurface = receipt.profileId;
			this.lastGroundId = receipt.platformId;
			const friction = frictionFor(receipt.profileId);
			player.courseFriction = {
				accelScale: friction.accelScale,
				decelScale: friction.decelScale
			};
		} else {
			this.lastGroundId = null;
			player.courseFriction = null;
		}
		if (!this.paused) {
			try {
				this.onFrameVisuals?.(Math.max(0, finite(dt)));
			} catch (error) { /* visuals must never break physics */ }
		}
		if (this.paused || !this.running || this.finished) return;
		// The run clock advances on real frame delta in beforePlayerFrame —
		// movers and the timer share one honest time source, never a fake one.
		this.checkCheckpoints(player, feetY);
		if (!this.finished && this.checkpointIndex >= this.def.checkpoints.length) {
			this.checkFinish(player, feetY);
		}
		if (this.finished) return;
		this.checkCoins(player, feetY);
		this.checkHazards(player, feetY);
		if (!this.inRegion(player.x, player.z, REGION_SLACK)) {
			this.respawn(player, 'out-of-bounds');
			return;
		}
		if (feetY < finite(this.def.killY)) {
			this.respawn(player, 'fall');
		}
	}

	checkCheckpoints(player, feetY) {
		const next = this.def.checkpoints[this.checkpointIndex];
		if (!next) return;
		if (horizontalDistance(player.x, player.z, finite(next.x), finite(next.z)) > finite(next.radius)) return;
		if (Math.abs(feetY - finite(next.y, finite(this.def.spawn.y))) > CHECKPOINT_Y_TOLERANCE) return;
		this.checkpointIndex += 1;
		this.emit('checkpoint', {
			checkpointIndex: this.checkpointIndex,
			total: this.def.checkpoints.length
		});
	}

	checkFinish(player, feetY) {
		if (this.checkpointIndex < this.def.checkpoints.length) return;
		const finish = this.def.finish;
		if (horizontalDistance(player.x, player.z, finite(finish.x), finite(finish.z)) > finite(finish.radius)) return;
		if (Math.abs(feetY - finite(finish.y, finite(this.def.spawn.y))) > CHECKPOINT_Y_TOLERANCE + 0.5) return;
		this.finished = true;
		this.running = false;
		const finalMs = Math.round(this.courseTime * 1000);
		let isBest = false;
		if (this.bestMs === null || finalMs < this.bestMs) {
			this.bestMs = finalMs;
			this.saveBestMs(finalMs);
			isBest = true;
		}
		this.emit('finish', {
			finalMs,
			bestMs: this.bestMs,
			isBest,
			parSeconds: this.def.parSeconds,
			coins: this.coinsCollected,
			respawns: this.respawnCount
		});
	}

	checkCoins(player, feetY) {
		const centerY = feetY + 0.8;
		this.def.coins.forEach((coin, index) => {
			if (this.collectedCoins.has(index)) return;
			const dx = player.x - finite(coin.x);
			const dy = centerY - finite(coin.y);
			const dz = player.z - finite(coin.z);
			if (Math.hypot(dx, dy, dz) > COIN_PICKUP_RADIUS) return;
			this.collectedCoins.add(index);
			this.coinsCollected += 1;
			this.emit('coin', { coins: this.coinsCollected, total: this.def.coins.length });
		});
	}

	checkHazards(player, feetY) {
		if (this.courseTime < finite(player.courseInvulnUntil)) return;
		const torsoMin = feetY + 0.35;
		const torsoMax = feetY + 1.45;
		for (const hazard of this.def.hazards) {
			const center = hazard.center || {};
			const armHalf = finite(hazard.armHeight) / 2;
			const armY = finite(center.y);
			if (torsoMax < armY - armHalf || torsoMin > armY + armHalf) continue;
			const angle = sweeperAngleAt(hazard, this.courseTime);
			const dirX = Math.sin(angle);
			const dirZ = Math.cos(angle);
			const endX = finite(center.x) + dirX * finite(hazard.armLength);
			const endZ = finite(center.z) + dirZ * finite(hazard.armLength);
			const distance = distanceToSegment(
				player.x, player.z,
				finite(center.x), finite(center.z),
				endX, endZ
			);
			if (distance < finite(hazard.armWidth) / 2 + PLAYER_RADIUS) {
				this.emit('hazard', { hazard });
				this.respawn(player, 'hazard');
				return;
			}
		}
	}

	/** Human-readable run snapshot for the HUD. */
	snapshot() {
		return {
			courseId: this.def.id,
			name: this.def.name,
			courseTimeMs: Math.round(this.courseTime * 1000),
			running: this.running,
			finished: this.finished,
			paused: this.paused,
			checkpointIndex: this.checkpointIndex,
			checkpointTotal: this.def.checkpoints.length,
			coins: this.coinsCollected,
			coinTotal: this.def.coins.length,
			respawns: this.respawnCount,
			bestMs: this.bestMs,
			parSeconds: this.def.parSeconds,
			surface: this.lastGroundSurface
		};
	}
}

function distanceToSegment(px, pz, ax, az, bx, bz) {
	const abx = bx - ax;
	const abz = bz - az;
	const lengthSquared = abx * abx + abz * abz;
	if (lengthSquared === 0) return Math.hypot(px - ax, pz - az);
	let t = ((px - ax) * abx + (pz - az) * abz) / lengthSquared;
	t = Math.max(0, Math.min(1, t));
	return Math.hypot(px - (ax + abx * t), pz - (az + abz * t));
}

export { PLAYER_RADIUS, STEP_UP_LIMIT };
