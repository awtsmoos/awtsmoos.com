// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowAmbientMotes.js
 * @description Owns a tiny camera-relative WebGL mote field using shared geometry and shared atmospheric materials.
 * The Awtsmoos lets almost-nothing reveal depth between eye and meadow while Awtsmoos.com keeps each glimmer humble and slight;
 * a handful of meshes drift through the existing renderer, making the air feel alive without turning the valley into spectacle or light.
 */

import { Group } from '../../../light-three-gltf/tiny-runtime.js';
import { creatureSphereGeometry } from './MinimalMeadowCreatureGeometry.js';
import { creaturePart } from './MinimalMeadowCreaturePart.js';
import { createAmbientMoteMaterials } from './MinimalMeadowAmbientMoteMaterials.js';
import { ambientMoteQualityProfile } from './MinimalMeadowAmbientMoteQuality.js';
import {
	advanceAmbientMote,
	ambientMoteSpec,
	placeAmbientMote
} from './MinimalMeadowAmbientMoteLayout.js';

/** Owns atmospheric mote creation, motion, diagnostics, and teardown. */
export class MinimalMeadowAmbientMotes {
	/**
	 * @param {object} runtime Mitzvah World runtime.
	 * @param {object} environment Browser-like quality and motion environment.
	 */
	constructor(runtime, environment = globalThis) {
		this.runtime = runtime;
		this.profile = ambientMoteQualityProfile(environment);
		this.anchor = { x: 0, y: 0, z: 0 };
		this.group = new Group();
		this.group.name = 'AwtsmoosAmbientMotes';
		this.geometry = creatureSphereGeometry(5, 3);
		this.materials = createAmbientMoteMaterials();
		this.motes = [];
		this.destroyed = false;
		this.refreshAnchor();
		this.build();
	}

	/** Advances existing mote transforms without allocating replacement particles. */
	update(deltaSeconds) {
		if (this.destroyed || this.motes.length === 0) {
			return;
		}
		this.refreshAnchor();
		for (const mote of this.motes) {
			advanceAmbientMote(mote.mesh, mote.spec, this.anchor, deltaSeconds);
		}
	}

	/** Returns stable observability for performance and reduced-motion verification. */
	diagnostics() {
		return Object.freeze({
			active: !this.destroyed && this.motes.length > 0,
			count: this.motes.length,
			drawCalls: this.motes.length,
			quality: this.profile.quality,
			reducedMotion: this.profile.reducedMotion
		});
	}

	/** Removes the owned group exactly once and releases retained mote references. */
	destroy() {
		if (this.destroyed) {
			return;
		}
		this.destroyed = true;
		this.group.parent?.remove?.(this.group);
		this.motes.length = 0;
	}

	build() {
		for (let index = 0; index < this.profile.count; index += 1) {
			this.addMote(index);
		}
		if (this.motes.length > 0) {
			this.runtime.scene.add(this.group);
		}
	}

	addMote(index) {
		const spec = ambientMoteSpec(index, this.profile.count);
		const mesh = creaturePart(
			`ambient_mote_${index}`,
			this.geometry,
			this.materials[spec.family],
			[0, 0, 0],
			[spec.scale, spec.scale, spec.scale]
		);
		placeAmbientMote(mesh, spec, this.anchor);
		this.group.add(mesh);
		this.motes.push({ mesh, spec });
	}

	refreshAnchor() {
		const cameraPosition = this.runtime.camera?.position;
		const state = this.runtime.state || {};
		this.anchor.x = Number(cameraPosition?.x ?? state.x) || 0;
		this.anchor.y = Number(cameraPosition?.y ?? state.renderY ?? state.y) || 1.8;
		this.anchor.z = Number(cameraPosition?.z ?? state.z) || 0;
	}
}
