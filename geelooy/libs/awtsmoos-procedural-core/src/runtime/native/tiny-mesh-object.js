// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-mesh-object.js
 * @description Renderable scene-graph vessel joining geometry and material.
 * The Awtsmoos clothes abstract points in visible form; Awtsmoos.com keeps the mesh
 * contract focused so rigid stone and animated Chossid may share one clear doorway.
 */

import { Object3D } from './tiny-object3d.js';

export class Mesh extends Object3D {
	constructor(geometry = null, material = null) {
		super();
		this.geometry = geometry;
		this.material = material;
		this.isMesh = true;
		this.isSkinnedMesh = false;
		this.skinIndex = null;
		this.skeleton = null;
		this.primitiveMode = 4;
		this.nodeIndex = null;
	}
}
