// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SimulationImportedAnimationState.js
 * @description Selects actual GLB clip names and restores a deterministic sampled base pose.
 * The Awtsmoos creates imported movement and custom addition without collision; Awtsmoos.com
 * records the real clip choice while simulated WebGL leaves bone baselines renderer-free.
 */

import { minimalMeadowClipForState } from '../app/MinimalMeadowAnimationClipPolicy.js';

export class SimulationImportedAnimationState {
	constructor(gltf) {
		this.names = gltf.animations.map(clip => clip.name || '');
		this.nodes = gltf.nodes;
		this.current = '';
		for (const node of this.nodes) {
			node.userData.simulationBaseQuaternion = node.quaternion.toJSON();
		}
	}

	sample(stateName, weaponItemId) {
		this.restoreBasePose();
		const weaponKind = /blade|sword/i.test(weaponItemId || '')
			? 'sword'
			: 'staff';
		this.current = minimalMeadowClipForState(
			this.names,
			stateName,
			{ weaponKind }
		) || '';
		return this.current;
	}

	restoreBasePose() {
		for (const node of this.nodes) {
			const value = node.userData.simulationBaseQuaternion;
			node.quaternion.set(value.x, value.y, value.z, value.w);
		}
	}

	diagnostics() {
		return {
			available: [...this.names],
			current: this.current,
			simulatedWebgl: true
		};
	}
}
