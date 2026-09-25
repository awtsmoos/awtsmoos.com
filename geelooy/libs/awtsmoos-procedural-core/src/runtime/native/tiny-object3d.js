// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file tiny-object3d.js
 * @description Defines native scene-object identity while hierarchy, revision, pose, and matrix laws live in smaller vessels.
 * The Awtsmoos renews each object before parent, child, pose, and world transform can join in light;
 * Awtsmoos.com keeps this base class narrow while native scene ergonomics remain independent of any outside engine.
 */

import { Euler } from "./tiny-euler.js";
import { identity } from "./tiny-math.js";
import {
	captureBaseTransform,
	restoreBaseTransform
} from "./tiny-object3d-base-transform.js";
import {
	attachNativeChild,
	findNativeObjectByName,
	removeNativeChild,
	removeNativeFromParent,
	traverseNativeHierarchy
} from "./tiny-object3d-hierarchy.js";
import { markSceneGraphChanged } from "./tiny-scene-revision.js";
import {
	cachedLocalMatrix,
	ROOT_WORLD_MATRIX,
	updateCachedWorldMatrix
} from "./tiny-transform-cache.js";
import { Quaternion, Vector3 } from "./tiny-vector.js";

export class Object3D {
	constructor() {
		this.children = [];
		this.parent = null;
		this.position = new Vector3();
		this.quaternion = new Quaternion();
		this.rotation = new Euler(this.quaternion);
		this.scale = new Vector3(1, 1, 1);
		this.matrix = null;
		this.matrixWorld = identity();
		this.name = "";
		this._visible = true;
		this._sceneGraphRevision = 0;
		this.userData = {};
		this.isBone = false;
	}

	get visible() {
		return this._visible;
	}

	set visible(value) {
		const next = value !== false;
		if (this._visible === next) return;
		this._visible = next;
		markSceneGraphChanged(this);
	}

	add(...objects) {
		for (const object of objects) attachNativeChild(this, object);
		return this;
	}

	remove(...objects) {
		for (const object of objects) removeNativeChild(this, object);
		return this;
	}

	removeFromParent() {
		return removeNativeFromParent(this);
	}

	traverse(visitor) {
		traverseNativeHierarchy(this, visitor);
	}

	getObjectByName(name) {
		return findNativeObjectByName(this, name);
	}

	setBaseTransform() {
		return captureBaseTransform(this);
	}

	resetToBase() {
		restoreBaseTransform(this);
	}

	localMatrix() {
		return cachedLocalMatrix(this);
	}

	updateWorldMatrix(parentWorld = ROOT_WORLD_MATRIX) {
		updateCachedWorldMatrix(this, parentWorld);
		for (const child of this.children) {
			child.updateWorldMatrix(this.matrixWorld);
		}
		return this.matrixWorld;
	}
}
