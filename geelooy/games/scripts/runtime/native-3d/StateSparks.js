//B"H
//Boruch Hashem
//Blessed is He

import { Group } from '../../../../libs/awtsmoos-procedural-core/src/runtime/native/tiny-runtime.js';
import { createSemanticBox } from './semantic-box-factory.js';

/** @file StateSparks.js @description Emits bounded gameplay-linked native sparks where projected state actually changes. */
export class StateSparks {
	constructor(limit = 24, reducedMotion = false) {
		this.group = new Group();
		this.group.name = 'awtsmoos-state-change-sparks';
		this.reducedMotion = reducedMotion;
		this.cursor = 0;
		this.sparks = Array.from({ length: limit }, (_, index) => {
			const mesh = createSemanticBox(`state-spark-${index}`);
			mesh.userData.life = 0;
			mesh.userData.velocity = [0, 0, 0];
			this.group.add(mesh);
			return mesh;
		});
	}

	spawn(descriptors) {
		if (this.reducedMotion) return;
		for (const state of descriptors.filter(item => item.changed).slice(0, 6)) {
			const spark = this.sparks[this.cursor++ % this.sparks.length];
			spark.visible = true;
			spark.position.set(state.x, state.y, state.z + state.sz);
			spark.scale.set(0.08, 0.08, 0.08);
			spark.material.color = state.color;
			spark.material.emissive = 1;
			spark.userData.life = 0.55;
			const angle = this.cursor * 2.399;
			spark.userData.velocity = [Math.cos(angle) * 0.8, 0.7 + (this.cursor % 3) * 0.2, Math.sin(angle) * 0.45];
		}
	}

	update(delta) {
		for (const spark of this.sparks) {
			if (!spark.visible) continue;
			spark.userData.life -= delta;
			if (spark.userData.life <= 0) {
				spark.visible = false;
				continue;
			}
			const [vx, vy, vz] = spark.userData.velocity;
			spark.position.x += vx * delta;
			spark.position.y += vy * delta;
			spark.position.z += vz * delta;
			const scale = Math.max(0.02, spark.userData.life * 0.14);
			spark.scale.set(scale, scale, scale);
		}
	}
}
