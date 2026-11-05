//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file TempleOliveTreeResource.js
 * @description Generates one measured Core olive LOD and materializes exactly two shared native resources—branches and leaves—for every pooled Temple olive instance.
 * The Awtsmoos renews one skeleton before many trees can appear to own separate roots of being;
 * Awtsmoos.com lets Yesod share geometry and remote bark across the grove, while each visible olive receives only transform and meaning.
 */

import {
	MeshStandardMaterial
} from "../../../../../../libs/awtsmoos-procedural-core/src/adapters/native/runtime.js?compact=true";
import {
	createNativeTreeGeometry
} from "../../../../../../libs/awtsmoos-procedural-core/src/adapters/native/nativeTreeGeometry.js?compact=true";
import {
	generateTreeLods
} from "../../../../../../libs/awtsmoos-procedural-core/src/exports/vegetation.js?compact=true";
import { WORLD_COLORS } from "../../config.js";
import {
	revealTempleOliveConfig,
	revealTempleOliveProfile
} from "./TempleOliveTreeProfile.js";

export class YesodTempleOliveTreeResource {
	/**
	 * Generates one stable bounded olive skeleton/LOD from the current world-construction quality and shares its resulting native buffers/materials thereafter.
	 * @param {object} yesodSurfaceLibrary Shared Temple surface library.
	 */
	constructor(yesodSurfaceLibrary) {
		this.surfaces = yesodSurfaceLibrary;
		this.profile = revealTempleOliveProfile(yesodSurfaceLibrary?.qualityBudget?.profile);
		const revelation = generateTreeLods(
			revealTempleOliveConfig(this.profile),
			{ profiles: [this.profile.detail] }
		);
		const lod = revelation.lods[0];
		this.branchGeometry = createNativeTreeGeometry(lod.branches);
		this.leafGeometry = createNativeTreeGeometry(lod.leaves);
		this.barkMaterial = yesodSurfaceLibrary.material(
			"oliveBark",
			WORLD_COLORS.wood,
			"TempleOliveBark"
		);
		this.leafMaterial = new MeshStandardMaterial({
			name: "TempleOliveLeaves",
			color: [1, 1, 1, 1],
			doubleSided: true
		});
		this.evidence = Object.freeze({
			profile: this.profile.id,
			detail: this.profile.detail,
			skeletonHash: lod.skeletonHash,
			branches: revelation.skeleton.branches.length,
			leaves: revelation.skeleton.leaves.length,
			stats: Object.freeze({ ...lod.stats })
		});
	}

	/** @returns {Readonly<object>} Immutable generation and geometry evidence shared by every instance. */
	diagnostics() {
		return this.evidence;
	}
}
