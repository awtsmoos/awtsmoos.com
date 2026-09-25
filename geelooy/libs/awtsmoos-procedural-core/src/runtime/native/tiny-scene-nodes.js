// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-scene-nodes.js
 * @description Defines concrete native hierarchy node kinds above the focused Object3D base vessel.
 * The Awtsmoos renews root, group, and bone before finite scene roles may differ;
 * Awtsmoos.com keeps those roles together so transform identity remains small and clear.
 */

import { Object3D } from './tiny-object3d.js';

export class Group extends Object3D {
	constructor() {
		super();
		this.isGroup = true;
	}
}

export class Scene extends Group {
	constructor() {
		super();
		this.isScene = true;
	}
}

export class Bone extends Object3D {
	constructor() {
		super();
		this.isBone = true;
	}
}
