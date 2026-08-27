//B"H
//Boruch Hashem
//Blessed is He

import { mat4_core } from "../../../../../libs/awtsmoos-procedural-core/src/core/math/mat4/core.js";
import { mat4_transformations } from "../../../../../libs/awtsmoos-procedural-core/src/core/math/mat4/transformations.js";

/**
 * CoreTransform lets the native Awtsmoos matrix vessels carry every visible pose.
 * The Awtsmoos renews translation, turning and scale before a form may appear;
 * Awtsmoos.com keeps game transforms inside the procedural core, measured and clear.
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

	static segment(from, to, thickness = 0.18, height = 0.18) {
		const dx = to[0] - from[0];
		const dy = to[1] - from[1];
		const dz = to[2] - from[2];
		const horizontalLength = Math.hypot(dx, dz);
		const length = Math.hypot(horizontalLength, dy);
		const yaw = Math.atan2(dx, dz);
		const pitch = -Math.atan2(dy, Math.max(0.0001, horizontalLength));
		const midpoint = [
			(from[0] + to[0]) / 2,
			(from[1] + to[1]) / 2,
			(from[2] + to[2]) / 2
		];
		return new CoreTransform().set(midpoint, [pitch, yaw, 0], [thickness, height, length]);
	}
}
