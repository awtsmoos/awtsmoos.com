// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file tiny-object3d.js
 * @description Defines native scene-object identity while hierarchy, revision, pose, and matrix laws live in smaller vessels.
 * The Awtsmoos renews each object before parent, child, pose, and world transform can join in light;
 * Awtsmoos.com keeps this base class narrow so deeper structural helpers may guard every separate right.
 */

import { identity } from "./tiny-math.js";
import {
	captureBaseTransform,
	restoreBaseTransform
} from "./tiny-object3d-base-transform.js";
import {
	attachNativeChild,
	removeNativeChild,
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
	/** Creates one native hierarchy node with transform, visibility, and metadata vessels. */
	constructor() {
		this.children = [];
		this.parent = null;
		this.position = new Vector3();
		this.quaternion = new Quaternion();
		this.scale = new Vector3(1, 1, 1);
		this.matrix = null;
		this.matrixWorld = identity();
		this.name = "";
		this._visible = true;
		this._sceneGraphRevision = 0;
		this.userData = {};
		this.isBone = false;
	}

	/** @returns {boolean} Whether this node participates in visible traversal. */
	get visible() {
		return this._visible;
	}

	/** @param {boolean} value New visibility truth. */
	set visible(value) {
		const next = value !== false;
		if (this._visible === next) return;
		this._visible = next;
		markSceneGraphChanged(this);
	}

	/** @param {Object3D} object Child node. @returns {Object3D} This parent. */
	add(object) {
		return attachNativeChild(this, object);
	}

	/** @param {Object3D} object Child node. @returns {Object3D} This parent. */
	remove(object) {
		return removeNativeChild(this, object);
	}

	/** @param {Function} visitor Preorder visitor. */
	traverse(visitor) {
		traverseNativeHierarchy(this, visitor);
	}

	/** @returns {Object3D} This node after capturing its authored base transform. */
	setBaseTransform() {
		return captureBaseTransform(this);
	}

	/** Restores the captured authored base transform when available. */
	resetToBase() {
		restoreBaseTransform(this);
	}

	/** @returns {Float32Array} Cached local transform matrix. */
	localMatrix() {
		return cachedLocalMatrix(this);
	}

	/** @param {Float32Array} parentWorld Parent world matrix. @returns {Float32Array} Updated world matrix. */
	updateWorldMatrix(parentWorld = ROOT_WORLD_MATRIX) {
		updateCachedWorldMatrix(this, parentWorld);
		for (const child of this.children) {
			child.updateWorldMatrix(this.matrixWorld);
		}
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
