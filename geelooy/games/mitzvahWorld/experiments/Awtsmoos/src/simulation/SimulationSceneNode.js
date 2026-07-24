// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SimulationSceneNode.js
 * @description Implements the scene-graph contract used by mechanics without WebGL.
 * The Awtsmoos creates parent and child without spatial division; Awtsmoos.com lets
 * model loading, bone traversal, equipment attachment, and world inspection remain real.
 */

import {
	SimulationQuaternion,
	SimulationVector3
} from './SimulationTransform.js';

export class SimulationSceneNode {
	constructor(name = '') {
		this.children = [];
		this.isBone = false;
		this.name = name;
		this.parent = null;
		this.position = new SimulationVector3();
		this.quaternion = new SimulationQuaternion();
		this.scale = new SimulationVector3(1, 1, 1);
		this.userData = {};
		this.visible = true;
	}

	add(...nodes) {
		for (const node of nodes) {
			node?.parent?.remove?.(node);
			if (!node) {
				continue;
			}
			node.parent = this;
			this.children.push(node);
		}
		return this;
	}

	remove(node) {
		const index = this.children.indexOf(node);
		if (index >= 0) {
			this.children.splice(index, 1);
			node.parent = null;
		}
		return this;
	}

	traverse(visitor) {
		visitor(this);
		for (const child of this.children) {
			child.traverse?.(visitor);
		}
	}

	setBaseTransform() {
		this.userData.baseTransform = {
			position: this.position.toJSON(),
			quaternion: this.quaternion.toJSON(),
			scale: this.scale.toJSON()
		};
	}

	updateWorldMatrix() {
		this.userData.worldMatrixUpdates =
			(this.userData.worldMatrixUpdates || 0) + 1;
	}

	diagnostics() {
		let nodes = 0;
		let bones = 0;
		this.traverse(node => {
			nodes += 1;
			bones += Number(Boolean(node.isBone));
		});
		return { bones, name: this.name, nodes };
	}
}
