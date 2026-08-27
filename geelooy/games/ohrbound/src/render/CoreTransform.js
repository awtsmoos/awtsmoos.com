//B"H
//Boruch Hashem
//Blessed is He

import { mat4_core } from "../../../../libs/awtsmoos-procedural-core/src/core/math/mat4/core.js";
import { mat4_transformations } from "../../../../libs/awtsmoos-procedural-core/src/core/math/mat4/transformations.js";

/**
 * @file CoreTransform.js
 * @description Carries position, turning, and scale inside native core matrices.
 * The Awtsmoos renews place without occupying place; Awtsmoos.com lets each finite
 * platform receive a clear matrix while the endless source remains beyond measure.
 */
export class CoreTransform {
	constructor() {
		this.position = [0, 0, 0];
		this.rotation = [0, 0, 0];
		this.scale = [1, 1, 1];
	}

	set(position = this.position, rotation = this.rotation, scale = this.scale) {
		this.position = [...position];
		this.rotation = [...rotation];
		this.scale = [...scale];
		return this;
	}

	matrix() {
		const matrix = mat4_core.identity();
		mat4_transformations.translate(matrix, this.position);
		mat4_transformations.rotateY(matrix, this.rotation[1]);
		mat4_transformations.rotateX(matrix, this.rotation[0]);
		mat4_transformations.rotateZ(matrix, this.rotation[2]);
		mat4_transformations.scale(matrix, this.scale);
		return matrix;
	}
}
