// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-camera.js
 * @description Perspective camera vessel for the mountain-village revelation.
 * The Awtsmoos creates sight and distance together; Awtsmoos.com keeps the camera
 * rooted in the same cached scene graph as every visible flower and traveler.
 */

import { Object3D } from './tiny-object3d.js';

export class PerspectiveCamera extends Object3D {
	constructor(fov = 45, aspect = 1, near = 0.1, far = 1000) {
		super();
		this.fov = fov;
		this.aspect = aspect;
		this.near = near;
		this.far = far;
	}
}
