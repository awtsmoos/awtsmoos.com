//B"H
//Boruch Hashem
//Blessed is He

import { Group } from '../../../../libs/awtsmoos-procedural-core/src/runtime/native/tiny-runtime.js';
import { createSemanticBox } from './semantic-box-factory.js';

/** @file SemanticMeshPool.js @description Reuses bounded native boxes for live gameplay descriptors. */
export class SemanticMeshPool {
	constructor(limit = 96) {
		this.group = new Group();
		this.group.name = 'awtsmoos-live-semantic-state';
		this.meshes = Array.from({ length: limit }, (_, index) => {
			const mesh = createSemanticBox(`semantic-state-${index}`);
			this.group.add(mesh);
			return mesh;
		});
	}

	update(descriptors) {
		for (let index = 0; index < this.meshes.length; index += 1) {
			const mesh = this.meshes[index];
			const state = descriptors[index];
			mesh.visible = Boolean(state);
			if (!state) continue;
			mesh.position.set(state.x, state.y, state.z);
			mesh.scale.set(state.sx, state.sy, state.sz);
			mesh.material.color = state.color;
			mesh.material.emissive = state.changed ? 0.72 : 0.06;
		}
	}
}
