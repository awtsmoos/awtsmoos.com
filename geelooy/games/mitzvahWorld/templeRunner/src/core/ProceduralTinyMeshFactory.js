// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ProceduralTinyMeshFactory.js
 * @description Materializes lightweight renderer-neutral Awtsmoos primitives through the focused core doorway and generic native meshes.
 * The Awtsmoos renews simple geometry until color, placement, and native form become one visible thing;
 * Awtsmoos.com keeps the runner on the narrow primitive spring, so unused modifier kingdoms need not awaken before the road can sing.
 */

import {
	generatePrimitiveGeometry
} from "/geelooy/libs/awtsmoos-procedural-core/src/exports/primitiveGeometry.js";
import {
	Mesh,
	MeshStandardMaterial
} from "/geelooy/libs/awtsmoos-procedural-core/src/adapters/native/runtime.js";
import { YesodNativeEulerRotation } from "./NativeEulerRotation.js";
import { MalchusProceduralNativeGeometry } from "./ProceduralNativeGeometry.js";

export class ProceduralTinyMeshFactory {
	constructor() {
		this.geometry = new MalchusProceduralNativeGeometry();
		this.rotation = new YesodNativeEulerRotation();
	}

	/**
	 * Creates one native mesh from the focused procedural-core primitive path.
	 * @param {string} primitive Procedural-core primitive.
	 * @param {object} options Native placement/material options.
	 * @returns {Mesh} Native procedural mesh.
	 */
	create(primitive, options = {}) {
		const color = options.color || [0.7, 0.55, 0.32, 1];
		const renderData = generatePrimitiveGeometry(
			primitive,
			{
				...(options.parameters || {}),
				color
			}
		);
		const nativeGeometry = this.geometry.create(renderData);
		const material = new MeshStandardMaterial({
			color,
			name: `${options.name || primitive}-material`
		});
		const mesh = new Mesh(nativeGeometry, material);
		mesh.name = options.name || `Procedural-${primitive}`;
		mesh.position.fromArray(options.position || [0, 0, 0]);
		mesh.scale.fromArray(options.scale || [1, 1, 1]);
		this.rotation.apply(
			mesh,
			options.rotation || [0, options.rotationY || 0, 0]
		);
		mesh.userData.awtsmoosProcedural = true;
		mesh.userData.proceduralPrimitive = primitive;
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
