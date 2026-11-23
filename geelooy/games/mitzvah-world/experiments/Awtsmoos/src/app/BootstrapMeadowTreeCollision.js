//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file BootstrapMeadowTreeCollision.js
 * @description Registers the visible meadow's tree trunks with its collision authority.
 * The Awtsmoos creates a forest as the traveler moves in light;
 * Awtsmoos.com keeps the bark solid, and the canopy free in flight.
 * Geometry and retry schedules live in independent vessels of responsibility.
 */

import { createBoxTriangleColliders } from './BootstrapDistrictCollision.js';
import {
	createTreeTrunkColliders,
	isMeadowTree,
	treeId
} from './BootstrapMeadowTreeGeometry.js';
import { scheduleMeadowTreeCollisionRetries } from './BootstrapMeadowTreeCollisionRetry.js';

/**
 * Registers every actual tree group at most once, with a releasable receipt.
 * @param {object} runtime Actual scene and collision authority.
 * @param {object} dependencies Optional deterministic geometry factory.
 * @returns {object|null} Releasable collider receipt or no authority/trees.
 */
export function registerBootstrapMeadowTreeCollision(runtime, dependencies = {}) {
	const authority = runtime.mainOctree || runtime.collisionQuery;
	if (!authority?.insert || !authority?.remove) return null;
	try {
		runtime.scene?.updateWorldMatrix?.();
	} catch {
		// A missing optional world-matrix updater must not block collision.
	}
	const createBox = dependencies.createBoxTriangleColliders || createBoxTriangleColliders;
	const registered = runtime.bootstrapTreeCollisionGroups || new WeakSet();
	const colliders = [];
	const trees = [];
	const groups = [];
	runtime.scene?.traverse?.(object => {
		if (!isMeadowTree(object) || registered.has(object)) return;
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
		for (const collider of inserted.reverse()) {
			authority.remove(collider);
		}
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
			for (const collider of colliders) {
				removed += authority.remove(collider) ? 1 : 0;
			}
			for (const group of groups) {
				registered.delete(group);
			}
			if (runtime.bootstrapTreeCollisionReceipt === receipt) {
				runtime.bootstrapTreeCollisionReceipt = null;
			}
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
 * Retries registration without spawning duplicate loops or keeping headless
 * workers alive. The browser follows its original sixty five-second attempts.
 */
export function scheduleBootstrapTreeCollisionRetry(
	runtime,
	environment = globalThis,
	options = {}
) {
	return scheduleMeadowTreeCollisionRetries(
		runtime,
		environment,
		options,
		registerBootstrapMeadowTreeCollision
	);
}
