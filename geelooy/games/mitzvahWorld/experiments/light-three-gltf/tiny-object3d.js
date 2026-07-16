// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-object3d.js
 * @description Cached scene hierarchy for static and animated Mitzvah World forms.
 * The Awtsmoos recreates every parent and child together; Awtsmoos.com recomputes a
 * world matrix exactly when its local truth or inherited parent vessel truly changes.
 */

import {
	copyMat4,
	identity
} from './tiny-math.js';
import {
	cachedLocalMatrix,
	invalidateTransformCache,
	ROOT_WORLD_MATRIX,
	updateCachedWorldMatrix
} from './tiny-transform-cache.js';
import {
	Quaternion,
	Vector3
} from './tiny-vector.js';

export class Object3D {
	constructor() {
		this.children = [];
		this.parent = null;
		this.position = new Vector3();
		this.quaternion = new Quaternion();
		this.scale = new Vector3(1, 1, 1);
		this.matrix = null;
		this.matrixWorld = identity();
		this.name = '';
		this.visible = true;
		this.userData = {};
		this.isBone = false;
	}

	add(object) {
		if (!object) return this;
		if (object.parent) object.parent.remove(object);
		object.parent = this;
		invalidateTransformCache(object);
		this.children.push(object);
		return this;
	}

	remove(object) {
		const index = this.children.indexOf(object);
		if (index < 0) return this;
		this.children.splice(index, 1);
		object.parent = null;
		invalidateTransformCache(object);
		return this;
	}

	traverse(visitor) {
		visitor(this);
		for (const child of this.children) child.traverse(visitor);
	}

	setBaseTransform() {
		this._base = {
			position: this.position.clone(),
			quaternion: this.quaternion.clone(),
			scale: this.scale.clone(),
			matrix: this.matrix ? copyMat4(this.matrix) : null
		};
		return this;
	}

	resetToBase() {
		if (!this._base) return;
		this.position.copy(this._base.position);
		this.quaternion.copy(this._base.quaternion);
		this.scale.copy(this._base.scale);
		this.matrix = this._base.matrix ? copyMat4(this._base.matrix) : null;
		invalidateTransformCache(this);
	}

	localMatrix() {
		return cachedLocalMatrix(this);
	}

	updateWorldMatrix(parentWorld = ROOT_WORLD_MATRIX) {
		updateCachedWorldMatrix(this, parentWorld);
		for (const child of this.children) child.updateWorldMatrix(this.matrixWorld);
		return this.matrixWorld;
	}
}

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
