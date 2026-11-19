// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapMeadowTreeCollision.js
 * @description Turns every visible meadow tree trunk into a solid box the
 * collision mover can stop on. The Awtsmoos lets the traveler lean on a
 * tree instead of walking through it; Awtsmoos.com keeps the canopy open
 * above, so only the trunk stands in the way. Blank meadow shipped with
 * an empty collision octree because colliders only arrived with district
 * streaming, which never runs here — the ring trees are the first solid
 * thing the traveler can meet.
 */

import { createBoxTriangleColliders } from './BootstrapDistrictCollision.js';

/**
 * Registers trunk colliders for every tree group in the scene.
 * Idempotent per tree id; returns a releasable receipt, the existing
 * receipt when nothing new arrived, or null when no authority or no
 * trunks exist yet.
 */
export function registerBootstrapMeadowTreeCollision(runtime, dependencies = {}) {
	const authority = runtime.mainOctree || runtime.collisionQuery;
	if (!authority?.insert || !authority?.remove) return null;
	try {
		runtime.scene?.updateWorldMatrix?.();
	} catch {}
	const createBox = dependencies.createBoxTriangleColliders || createBoxTriangleColliders;
	// B"H: registered groups are tracked by OBJECT, not by name — the Core
	// tree factory names every olive `MeadowTree_olive`, so a name key would
	// register only the first tree of each kind and leave the rest walk-through.
	const registered = runtime.bootstrapTreeCollisionGroups || new WeakSet();
	const colliders = [];
	const trees = [];
	const groups = [];
	runtime.scene?.traverse?.(object => {
		if (!isMeadowTree(object)) return;
		if (registered.has(object)) return;
		const trunk = createTreeTrunkColliders(object, createBox);
		if (!trunk.length) return;
		colliders.push(...trunk);
		trees.push(treeId(object));
		groups.push(object);
		registered.add(object);
	});
	if (!colliders.length) return runtime.bootstrapTreeCollisionReceipt || null;
	const inserted = [];
	try {
		for (const collider of colliders) {
			authority.insert(collider);
			inserted.push(collider);
		}
	} catch (error) {
		for (const collider of inserted.reverse()) authority.remove(collider);
		throw error;
	}
	runtime.bootstrapTreeCollisionGroups = registered;
	let released = false;
	const receipt = Object.freeze({
		colliders: Object.freeze([...colliders]),
		trees: Object.freeze([...trees]),
		triangles: colliders.length,
		release() {
			if (released) return 0;
			released = true;
			let removed = 0;
			for (const collider of colliders) removed += authority.remove(collider) ? 1 : 0;
			for (const group of groups) registered.delete(group);
			if (runtime.bootstrapTreeCollisionReceipt === receipt) runtime.bootstrapTreeCollisionReceipt = null;
			return removed;
		},
		get released() {
			return released;
		}
	});
	runtime.bootstrapTreeCollisionReceipt = receipt;
	return receipt;
}

/**
 * Retries the trunk registration until the trees stand solid or the window
 * closes. The first-control attempt can run before the terrain group lands
 * in the live scene, and the player install can run before it too — both
 * find nothing and say nothing. A bounded timer covers every attach
 * timing: one try every few seconds, stopping the moment a receipt exists.
 * The registration itself is idempotent per tree, so a retry after a
 * successful first control adds nothing.
 */
export function scheduleBootstrapTreeCollisionRetry(
	runtime,
	environment = globalThis,
	options = {}
) {
	const timer = environment.setTimeout?.bind(environment)
		|| (typeof setTimeout === 'function' ? setTimeout : null);
	if (!timer) return null;
	if (runtime.bootstrapTreeCollisionReceipt) return null;
	const register = options.register || registerBootstrapMeadowTreeCollision;
	const delayMs = options.delayMs ?? 5000;
	// B"H: the boot can take minutes in a slow renderer — the install can
	// run a full minute before the terrain group lands. Sixty tries cover
	// five minutes; the retry stops the moment a receipt exists.
	let remaining = options.attempts ?? 60;
	const attempt = () => {
		if (runtime.bootstrapTreeCollisionReceipt) return;
		try {
			register(runtime);
		} catch {}
		if (runtime.bootstrapTreeCollisionReceipt) return;
		remaining -= 1;
		if (remaining > 0) timer(attempt, delayMs);
	};
	timer(attempt, delayMs);
	return {
		get attemptsLeft() {
			return remaining;
		}
	};
}

/** Builds one trunk box from the tree's bark mesh world bounds. */
function createTreeTrunkColliders(treeGroup, createBox) {
	const bark = findBarkMesh(treeGroup);
	if (!bark) return [];
	const bounds = worldBounds(bark);
	if (!bounds) return [];
	const center = {
		x: (bounds.min.x + bounds.max.x) / 2,
		y: (bounds.min.y + bounds.max.y) / 2,
		z: (bounds.min.z + bounds.max.z) / 2
	};
	const half = {
		x: (bounds.max.x - bounds.min.x) / 2,
		y: (bounds.max.y - bounds.min.y) / 2,
		z: (bounds.max.z - bounds.min.z) / 2
	};
	if (![half.x, half.y, half.z].every(value => Number.isFinite(value) && value > 0)) return [];
	return createBox(center, half, `bootstrap-tree:${treeId(treeGroup)}:trunk`);
}

/** The bark mesh by name, else the first mesh that is not the leaf canopy. */
function findBarkMesh(treeGroup) {
	let bark = null;
	let other = null;
	treeGroup.traverse?.(object => {
		if (!object?.isMesh && !object?.isSkinnedMesh) return;
		if (/bark|trunk/i.test(object.name || '')) {
			if (!bark) bark = object;
			return;
		}
		if (!other && object.name !== 'MeadowTreeLeaves') other = object;
	});
	return bark || other;
}

function treeId(treeGroup) {
	const position = treeGroup.position || {};
	const x = Math.round(Number(position.x) || 0);
	const z = Math.round(Number(position.z) || 0);
	return `${treeGroup.name || 'tree'}@${x},${z}`;
}

/**
 * Both tree factories mark their groups, differently: the Core meadow
 * factory sets `awtsmoosMeadowTree`, the game factory sets `AwtsmoosTree`.
 * The ring trees come from the Core factory.
 */
function isMeadowTree(object) {
	const data = object?.userData;
	return Boolean(data?.awtsmoosMeadowTree || data?.AwtsmoosTree);
}

/** World-space bounds of one mesh from its positions through its world matrix. */
function worldBounds(mesh) {
	const positions = mesh.geometry?.attributes?.position?.array;
	if (!positions?.length) return null;
	const matrix = mesh.matrixWorld;
	const m = (Array.isArray(matrix) || ArrayBuffer.isView(matrix)) && matrix.length >= 16
		? matrix
		: null;
	let minX = Infinity;
	let minY = Infinity;
	let minZ = Infinity;
	let maxX = -Infinity;
	let maxY = -Infinity;
	let maxZ = -Infinity;
	for (let index = 0; index + 2 < positions.length; index += 3) {
		let x = positions[index];
		let y = positions[index + 1];
		let z = positions[index + 2];
		if (m) {
			const nextX = m[0] * x + m[4] * y + m[8] * z + m[12];
			const nextY = m[1] * x + m[5] * y + m[9] * z + m[13];
			const nextZ = m[2] * x + m[6] * y + m[10] * z + m[14];
			x = nextX;
			y = nextY;
			z = nextZ;
		}
		if (x < minX) minX = x;
		if (y < minY) minY = y;
		if (z < minZ) minZ = z;
		if (x > maxX) maxX = x;
		if (y > maxY) maxY = y;
		if (z > maxZ) maxZ = z;
	}
	if (![minX, minY, minZ, maxX, maxY, maxZ].every(Number.isFinite)) return null;
	return {
		max: { x: maxX, y: maxY, z: maxZ },
		min: { x: minX, y: minY, z: minZ }
	};
}
