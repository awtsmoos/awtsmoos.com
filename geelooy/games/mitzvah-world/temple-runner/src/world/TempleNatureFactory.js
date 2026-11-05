//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file TempleNatureFactory.js
 * @description Creates lightweight olive instances from one shared bounded Procedural Core tree resource, replacing primitive trunk/blob crowns without duplicating tree geometry per pooled district.
 * The Awtsmoos renews one living pattern while many olives appear beside the Jerusalem road;
 * Awtsmoos.com lets Tzomayach vary position, quaternion turn, and scale while shared bark and leaves keep the bounded world broad.
 */

import {
	Group,
	Mesh
} from "../../../../../libs/awtsmoos-procedural-core/src/adapters/native/runtime.js?compact=true";
import { YesodNativeEulerRotation } from "../core/NativeEulerRotation.js";
import { YesodTempleOliveTreeResource } from "./nature/TempleOliveTreeResource.js";

const STATIC_MODEL = Object.freeze({ static: true });

export class TzomayachTempleNatureFactory {
	/**
	 * Creates one shared Core olive resource and one shared native Euler→quaternion adapter for all later tree instances.
	 * @param {object} meshFactory Procedural native mesh materializer owning the shared surface library.
	 */
	constructor(meshFactory) {
		this.meshFactory = meshFactory;
		this.rotation = new YesodNativeEulerRotation();
		this.olive = new YesodTempleOliveTreeResource(meshFactory.surfaces);
	}

	/**
	 * Creates one two-mesh olive instance referencing shared branch/leaf geometry and materials, varying only deterministic transform data.
	 * @param {number} x World X outside the runner corridor.
	 * @param {number} z Local Z.
	 * @param {number} seed Deterministic instance seed.
	 * @returns {Group} Lightweight native olive group.
	 */
	createTree(x, z, seed = 0) {
		const root = new Group();
		root.name = "TempleOliveTree";
		const branches = new Mesh(this.olive.branchGeometry, this.olive.barkMaterial);
		const leaves = new Mesh(this.olive.leafGeometry, this.olive.leafMaterial);
		branches.name = "TempleOliveBranches";
		leaves.name = "TempleOliveLeaves";
		branches.userData.AwtsmoosWorldModel = STATIC_MODEL;
		leaves.userData.AwtsmoosWorldModel = STATIC_MODEL;
		root.add(branches);
		root.add(leaves);
		const variation = revealTreeVariation(seed, this.olive.profile.baseScale);
		root.position.set(x, 0, z);
		this.rotation.apply(root, [0, variation.rotationY, 0]);
		root.scale.set(variation.scale, variation.scale, variation.scale);
		root.userData.AwtsmoosWorldModel = STATIC_MODEL;
		root.userData.awtsmoosOlive = Object.freeze({
			profile: this.olive.profile.id,
			skeletonHash: this.olive.evidence.skeletonHash,
			seed
		});
		return root;
	}

	/** @returns {Readonly<object>} Shared Core olive provenance and measured geometry cost. */
	diagnostics() {
		return this.olive.diagnostics();
	}
}

/**
 * Resolves stable transform variety without regenerating topology or mutating any shared geometry/material resource.
 * @param {number} netzachSeed Instance seed.
 * @param {number} tiferesBaseScale Measured world scale.
 * @returns {Readonly<object>} Deterministic yaw and uniform scale.
 */
function revealTreeVariation(netzachSeed, tiferesBaseScale) {
	const phase = Number(netzachSeed) * 0.61803398875;
	const fraction = phase - Math.floor(phase);
	return Object.freeze({
		rotationY: fraction * Math.PI * 2,
		scale: tiferesBaseScale * (0.92 + fraction * 0.16)
	});
}
