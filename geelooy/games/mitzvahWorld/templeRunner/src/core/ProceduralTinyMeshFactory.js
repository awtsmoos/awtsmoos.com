//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ProceduralTinyMeshFactory.js
 * @description Materializes focused Core primitives with fallback-first semantic surfaces and optional ecological-zone identity while keeping renderer, texture, and gameplay ownership separated.
 * The Awtsmoos renews simple geometry until color, texture, placement, zone, and native form become one visible thing;
 * Awtsmoos.com keeps ordinary meshes plain while chosen Jerusalem stone may deepen through cached ecological light without a rival renderer wing.
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
	/** @param {YesodTempleSurfaceLibrary} [surfaceLibrary] Shared semantic surface library. */
	constructor(surfaceLibrary = new YesodTempleSurfaceLibrary()) {
		this.geometry = new MalchusProceduralNativeGeometry();
		this.rotation = new YesodNativeEulerRotation();
		this.surfaces = surfaceLibrary;
	}

	/**
	 * Creates one native mesh from the focused procedural-core primitive path.
	 * @param {string} primitive Procedural-core primitive.
	 * @param {object} options Native placement, semantic zone, material, and surface options.
	 * @returns {Mesh} Native procedural mesh.
	 */
	create(primitive, options = {}) {
		const color = options.color || [0.7, 0.55, 0.32, 1];
		const renderData = generatePrimitiveGeometry(primitive, {
			...(options.parameters || {}),
			color
		});
		const nativeGeometry = this.geometry.create(renderData, { zone: options.zone });
		const materialName = `${options.name || primitive}-material`;
		const material = options.surface
			? this.surfaces.material(options.surface, color, materialName)
			: new MeshStandardMaterial({ color, name: materialName });
		const mesh = new Mesh(nativeGeometry, material);
		mesh.name = options.name || `Procedural-${primitive}`;
		mesh.position.fromArray(options.position || [0, 0, 0]);
		mesh.scale.fromArray(options.scale || [1, 1, 1]);
		this.rotation.apply(mesh, options.rotation || [0, options.rotationY || 0, 0]);
		mesh.userData.awtsmoosProcedural = true;
		mesh.userData.proceduralPrimitive = primitive;
		mesh.userData.awtsmoosSurface = options.surface || "";
		mesh.userData.awtsmoosZone = options.zone ? Object.freeze([...options.zone]) : undefined;
		mesh.userData.AwtsmoosWorldModel = options.worldModel || undefined;
		return mesh;
	}

	/** @param {object} options Cube options. @returns {Mesh} */
	cube(options = {}) {
		return this.create("cube", options);
	}

	/** @param {object} options Cylinder options. @returns {Mesh} */
	cylinder(options = {}) {
		return this.create("cylinder", options);
	}

	/** @param {object} options Icosphere options. @returns {Mesh} */
	icosphere(options = {}) {
		return this.create("icosphere", options);
	}

	/** @param {object} options Torus options. @returns {Mesh} */
	torus(options = {}) {
		return this.create("torus", options);
	}
}
