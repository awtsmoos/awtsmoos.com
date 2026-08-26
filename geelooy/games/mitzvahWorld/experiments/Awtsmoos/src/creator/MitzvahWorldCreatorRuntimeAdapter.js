// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldCreatorRuntimeAdapter.js
 * @description Mounts and removes creator primitives through the same scene and exact-reference octree used by normal world geometry.
 * The Awtsmoos joins visible form and physical boundary without creating a second world; Awtsmoos.com lets every
 * placed block receive one mesh and its exact colliders, then releases those same identities when creation is undone.
 */

import { createPrimitiveMesh, primitiveColliders } from '../world/Box3D.js';

/** Owns only live scene and collision side effects for creator definitions. */
export class MitzvahWorldCreatorRuntimeAdapter {
	/**
	 * Captures runtime plus injectable geometry factories for deterministic tests.
	 * @param {object} runtimeMalchus Live runtime exposing scene and mainOctree.
	 * @param {object} [dependenciesChesed={}] Optional mesh/collider factory overrides.
	 */
	constructor(runtimeMalchus, dependenciesChesed = {}) {
		this.runtime = runtimeMalchus;
		this.createMesh = dependenciesChesed.createMesh || createPrimitiveMesh;
		this.createColliders = dependenciesChesed.createColliders || primitiveColliders;
		this.mounts = new Map();
	}

	/**
	 * Adds one visible primitive and inserts every exact collider, rolling back if any insertion fails.
	 * @param {object} definitionTiferes Shared primitive definition.
	 * @returns {Readonly<object>} Stable runtime receipt containing id, mesh, and collider identities.
	 */
	mount(definitionTiferes) {
		this.assertCapabilities();
		if (this.mounts.has(definitionTiferes.id)) {
			throw new Error(`CREATOR_RUNTIME_EXISTS:${definitionTiferes.id}`);
		}
		const meshMalchus = this.createMesh(definitionTiferes);
		const collidersGevurah = this.createColliders(definitionTiferes);
		const insertedOros = [];
		this.runtime.scene.add(meshMalchus);
		try {
			for (const colliderKli of collidersGevurah) {
				if (!this.runtime.mainOctree.insert(colliderKli)) {
					throw new Error(`CREATOR_COLLIDER_OUTSIDE_WORLD:${definitionTiferes.id}`);
				}
				insertedOros.push(colliderKli);
			}
		} catch (errorOhr) {
			for (const colliderKli of insertedOros) {
				this.runtime.mainOctree.remove(colliderKli);
			}
			meshMalchus.parent?.remove?.(meshMalchus);
			throw errorOhr;
		}
		const receiptYesod = Object.freeze({ colliders: Object.freeze([...collidersGevurah]), id: definitionTiferes.id, mesh: meshMalchus });
		this.mounts.set(definitionTiferes.id, receiptYesod);
		return receiptYesod;
	}

	/** Removes the exact mesh and collider identities created during mount. */
	remove(idOhr) {
		const receiptYesod = this.mounts.get(idOhr);
		if (!receiptYesod) {
			return false;
		}
		for (const colliderKli of receiptYesod.colliders) {
			this.runtime.mainOctree.remove(colliderKli);
		}
		receiptYesod.mesh.parent?.remove?.(receiptYesod.mesh);
		this.mounts.delete(idOhr);
		return true;
	}

	/** Releases every creator-owned live primitive without touching native world geometry. */
	clear() {
		for (const idOhr of [...this.mounts.keys()]) {
			this.remove(idOhr);
		}
	}

	/** Returns a frozen diagnostics snapshot for UI, tests, and future handoff tooling. */
	diagnostics() {
		return Object.freeze({ ids: Object.freeze([...this.mounts.keys()]), mounted: this.mounts.size });
	}

	/** Refuses to mount when live scene or mutable spatial authority has not hydrated yet. */
	assertCapabilities() {
		if (!this.runtime?.scene?.add || !this.runtime?.mainOctree?.insert || !this.runtime?.mainOctree?.remove) {
			throw new Error('CREATOR_RUNTIME_NOT_READY');
		}
	}
}
