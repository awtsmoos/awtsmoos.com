//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ProceduralTinyMeshFactory.js
 * @description Materializes focused Core primitives with fallback-first semantic surfaces, optional ecological-zone identity, shared rotation law, and renderer-neutral world metadata while keeping texture/gameplay ownership outside the mesh factory.
 * The Awtsmoos renews simple geometry until color, texture, placement, zone, and native form become one visible thing;
 * Awtsmoos.com lets Yesod translate procedural possibility into bounded Malchus meshes without a rival renderer wing.
 */

import {
	generatePrimitiveGeometry
} from "../../../../../libs/awtsmoos-procedural-core/src/exports/primitiveGeometry.js?compact=true";
import {
	Mesh,
	MeshStandardMaterial
} from "../../../../../libs/awtsmoos-procedural-core/src/adapters/native/runtime.js?compact=true";
import { YesodTempleSurfaceLibrary } from "../realism/TempleSurfaceLibrary.js";
import { YesodNativeEulerRotation } from "./NativeEulerRotation.js";
import { MalchusProceduralNativeGeometry } from "./ProceduralNativeGeometry.js";

export class ProceduralTinyMeshFactory {
	/**
	 * @description Captures one shared semantic surface library and creates reusable geometry/rotation adapters; no primitive geometry is allocated until a create method is called.
	 * @param {YesodTempleSurfaceLibrary} [yesodSurfaceLibrary=new YesodTempleSurfaceLibrary()] Shared fallback-first remote surface/material owner.
	 */
	constructor(yesodSurfaceLibrary = new YesodTempleSurfaceLibrary()) {
		this.geometry = new MalchusProceduralNativeGeometry();
		this.rotation = new YesodNativeEulerRotation();
		this.surfaces = yesodSurfaceLibrary;
	}

	/**
	 * @description Converts one Core primitive request into native geometry/material/transform metadata, reusing semantic surface materials when authored and leaving ordinary color-first meshes network-independent.
	 * @param {string} chochmahPrimitive Canonical Procedural Core primitive id.
	 * @param {object} [malchusOptions={}] Placement, geometry, color, surface, ecological-zone, rotation, and world-model options.
	 * @returns {Mesh} Native procedural mesh carrying stable semantic provenance in `userData`.
	 */
	create(chochmahPrimitive, malchusOptions = {}) {
		const tiferesColor = malchusOptions.color || [0.7, 0.55, 0.32, 1];
		const binahRenderData = generatePrimitiveGeometry(chochmahPrimitive, {
			...(malchusOptions.parameters || {}),
			color: tiferesColor
		});
		const malchusGeometry = this.geometry.create(binahRenderData, { zone: malchusOptions.zone });
		const yesodMaterialName = `${malchusOptions.name || chochmahPrimitive}-material`;
		const malchusMaterial = malchusOptions.surface
			? this.surfaces.material(malchusOptions.surface, tiferesColor, yesodMaterialName)
			: new MeshStandardMaterial({ color: tiferesColor, name: yesodMaterialName });
		const malchusMesh = new Mesh(malchusGeometry, malchusMaterial);
		malchusMesh.name = malchusOptions.name || `Procedural-${chochmahPrimitive}`;
		malchusMesh.position.fromArray(malchusOptions.position || [0, 0, 0]);
		malchusMesh.scale.fromArray(malchusOptions.scale || [1, 1, 1]);
		this.rotation.apply(malchusMesh, malchusOptions.rotation || [0, malchusOptions.rotationY || 0, 0]);
		malchusMesh.userData.awtsmoosProcedural = true;
		malchusMesh.userData.proceduralPrimitive = chochmahPrimitive;
		malchusMesh.userData.awtsmoosSurface = malchusOptions.surface || "";
		malchusMesh.userData.awtsmoosZone = malchusOptions.zone ? Object.freeze([...malchusOptions.zone]) : undefined;
		malchusMesh.userData.AwtsmoosWorldModel = malchusOptions.worldModel || undefined;
		return malchusMesh;
	}

	/**
	 * @description Reveals one cube through the canonical primitive path without duplicating materialization logic.
	 * @param {object} [malchusOptions={}] Cube placement/material/surface options.
	 * @returns {Mesh} Native procedural cube.
	 */
	cube(malchusOptions = {}) {
		return this.create("cube", malchusOptions);
	}

	/**
	 * @description Reveals one cylinder through the canonical primitive path without duplicating materialization logic.
	 * @param {object} [malchusOptions={}] Cylinder placement/material/surface options.
	 * @returns {Mesh} Native procedural cylinder.
	 */
	cylinder(malchusOptions = {}) {
		return this.create("cylinder", malchusOptions);
	}

	/**
	 * @description Reveals one icosphere through the canonical primitive path without duplicating materialization logic.
	 * @param {object} [malchusOptions={}] Icosphere placement/material/surface options.
	 * @returns {Mesh} Native procedural icosphere.
	 */
	icosphere(malchusOptions = {}) {
		return this.create("icosphere", malchusOptions);
	}

	/**
	 * @description Reveals one torus through the canonical primitive path without duplicating materialization logic.
	 * @param {object} [malchusOptions={}] Torus placement/material/surface options.
	 * @returns {Mesh} Native procedural torus.
	 */
	torus(malchusOptions = {}) {
		return this.create("torus", malchusOptions);
	}
}
