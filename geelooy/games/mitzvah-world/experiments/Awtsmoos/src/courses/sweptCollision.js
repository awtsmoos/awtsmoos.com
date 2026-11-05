// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file sweptCollision.js
 * @description Real anti-tunneling collision between the player capsule and
 * moving boxes. Mover travel is substepped so no single substep moves farther
 * than a fraction of the player radius; at each substep an overlapping player
 * who is not standing on the box is pushed out along the smallest horizontal
 * penetration axis. Standing players instead ride: the mover delta carries them.
 * The Awtsmoos never lets a platform pass through the traveler — it carries
 * or it yields, but it never pierces.
 */

export const PLAYER_RADIUS = 0.35;
export const PLAYER_HEIGHT = 1.6;
export const STEP_UP_LIMIT = 0.55;
const MAX_SUBSTEP_TRAVEL = 0.15;

function finite(value, fallback = 0) {
	const n = Number(value);
	return Number.isFinite(n) ? n : fallback;
}

/**
 * Player capsule feet/box at a position.
 * @param {number} x Feet x. @param {number} y Feet y. @param {number} z Feet z.
 * @returns {{minX:number,maxX:number,minY:number,maxY:number,minZ:number,maxZ:number}}
 */
export function playerBoxAt(x, y, z) {
	return {
		minX: x - PLAYER_RADIUS,
		maxX: x + PLAYER_RADIUS,
		minY: y,
		maxY: y + PLAYER_HEIGHT,
		minZ: z - PLAYER_RADIUS,
		maxZ: z + PLAYER_RADIUS
	};
}

function boxesOverlap(a, b) {
	return a.minX < b.maxX && a.maxX > b.minX
		&& a.minY < b.maxY && a.maxY > b.minY
		&& a.minZ < b.maxZ && a.maxZ > b.minZ;
}

/**
 * Whether the player stands on top of a box (feet near the box top, XZ inside).
 * @param {object} player {x, y, z}.
 * @param {object} box Box.
 * @returns {boolean}
 */
export function isStandingOnBox(player, box) {
	const feetY = finite(player.y);
	if (Math.abs(feetY - box.maxY) > STEP_UP_LIMIT) return false;
	if (feetY < box.maxY - STEP_UP_LIMIT) return false;
	return player.x > box.minX - PLAYER_RADIUS
		&& player.x < box.maxX + PLAYER_RADIUS
		&& player.z > box.minZ - PLAYER_RADIUS
		&& player.z < box.maxZ + PLAYER_RADIUS;
}

/**
 * Pushes the player out of a box along the smallest horizontal penetration
 * axis. Vertical overlap is ignored when the player can step onto the box.
 * Mutates player.x / player.z.
 * @param {object} player Mutable {x, y, z}.
 * @param {object} box Box.
 * @returns {boolean} Whether a push happened.
 */
export function pushOutOfBox(player, box) {
	const feetY = finite(player.y);
	// Can step onto it: no horizontal push.
	if (feetY >= box.maxY - STEP_UP_LIMIT) return false;
	// Head below the box bottom: no push (player is fully under it).
	if (feetY + PLAYER_HEIGHT <= box.minY) return false;
	const px = playerBoxAt(player.x, feetY, player.z);
	if (!boxesOverlap(px, box)) return false;
	const pushLeft = px.maxX - box.minX;
	const pushRight = box.maxX - px.minX;
	const pushBack = px.maxZ - box.minZ;
	const pushForward = box.maxZ - px.minZ;
	const min = Math.min(pushLeft, pushRight, pushBack, pushForward);
	if (min === pushLeft) player.x = box.minX - PLAYER_RADIUS;
	else if (min === pushRight) player.x = box.maxX + PLAYER_RADIUS;
	else if (min === pushBack) player.z = box.minZ - PLAYER_RADIUS;
	else player.z = box.maxZ + PLAYER_RADIUS;
	return true;
}

/**
 * Resolves one mover's travel from boxPrev to boxNow against the player.
 * The travel is substepped (each substep ≤ MAX_SUBSTEP_TRAVEL) so a fast
 * mover cannot tunnel through the player; instead it pushes.
 * Standing players are NOT pushed — the caller carries them by the delta.
 * @param {object} player Mutable {x, y, z}.
 * @param {object} boxPrev Box at the previous time.
 * @param {object} boxNow Box at the current time.
 * @returns {{pushed: boolean, substeps: number}} Resolution receipt.
 */
export function resolveSweptMover(player, boxPrev, boxNow) {
	const travel = Math.max(
		Math.abs(boxNow.minX - boxPrev.minX),
		Math.abs(boxNow.minZ - boxPrev.minZ),
		Math.abs(boxNow.minY - boxPrev.minY)
	);
	const substeps = Math.max(1, Math.ceil(travel / MAX_SUBSTEP_TRAVEL));
	let pushed = false;
	for (let i = 1; i <= substeps; i++) {
		const ratio = i / substeps;
		const box = {
			minX: boxPrev.minX + (boxNow.minX - boxPrev.minX) * ratio,
			maxX: boxPrev.maxX + (boxNow.maxX - boxPrev.maxX) * ratio,
			minY: boxPrev.minY + (boxNow.minY - boxPrev.minY) * ratio,
			maxY: boxPrev.maxY + (boxNow.maxY - boxPrev.maxY) * ratio,
			minZ: boxPrev.minZ + (boxNow.minZ - boxPrev.minZ) * ratio,
			maxZ: boxPrev.maxZ + (boxNow.maxZ - boxPrev.maxZ) * ratio
		};
		if (isStandingOnBox(player, box)) continue;
		if (pushOutOfBox(player, box)) pushed = true;
	}
	return { pushed, substeps };
}

/**
 * Applies carry: a player standing on a moved box rides its delta.
 * Mutates player.x / player.z (vertical snap is handled by the ground pass).
 * @param {object} player Mutable {x, y, z}.
 * @param {object} boxPrev Box before the move.
 * @param {object} boxNow Box after the move.
 * @returns {boolean} Whether the player was carried.
 */
export function applyCarry(player, boxPrev, boxNow) {
	if (!isStandingOnBox(player, boxPrev) && !isStandingOnBox(player, boxNow)) return false;
	const dx = (boxNow.minX + boxNow.maxX) / 2 - (boxPrev.minX + boxPrev.maxX) / 2;
	const dz = (boxNow.minZ + boxNow.maxZ) / 2 - (boxPrev.minZ + boxPrev.maxZ) / 2;
	player.x += dx;
	player.z += dz;
	return true;
}
