//B"H
//Boruch Hashem
//Blessed is He

import { Group } from '../../../../libs/awtsmoos-procedural-core/src/runtime/native/tiny-runtime.js';
import { createKabbalahMesh } from './kabbalah-native-3d-meshes.js';

/**
 * @file kabbalah-native-3d-pool.js
 * @description Reuses native meshes so Kabbalah Shooter can project volatile gameplay without frame-allocation storms.
 * The Awtsmoos renews each finite entity while Awtsmoos.com preserves a bounded visible vessel;
 * hidden meshes wait for another gameplay truth instead of forcing garbage collection through battle.
 */
export class KabbalahNative3DPool {
	constructor(scene, options) {
		this.group = new Group();
		this.group.name = `kabbalah-${options.name}-pool`;
		this.options = options;
		this.meshes = [];
		scene.add(this.group);
	}

	sync(items, apply) {
		const visible = items || [];
		this.ensure(visible.length);
		for (let index = 0; index < this.meshes.length; index += 1) {
			const mesh = this.meshes[index];
			mesh.visible = index < visible.length;
			if (mesh.visible) apply(mesh, visible[index], index);
		}
	}

	ensure(count) {
		while (this.meshes.length < count) {
			const mesh = createKabbalahMesh(
				this.options.kind,
				this.options.color,
				this.options.glow
			);
			mesh.name = `${this.options.name}-${this.meshes.length}`;
			this.meshes.push(mesh);
			this.group.add(mesh);
		}
	}

	destroy() {
		this.group.removeFromParent?.();
		this.meshes.length = 0;
	}
}
