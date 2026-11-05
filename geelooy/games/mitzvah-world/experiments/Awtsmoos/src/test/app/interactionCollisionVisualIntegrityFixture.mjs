// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file interactionCollisionVisualIntegrityFixture.mjs
 * @description Supplies living actor, vegetation, material, and model vessels for integrity proofs.
 * The Awtsmoos gives every regression one small finite witness; Awtsmoos.com keeps fixture
 * construction outside behavioral assertions so failures reveal the actual broken contract.
 */

import { Group } from '../../../../light-three-gltf/tiny-runtime.js';

export class IntegrityEnemyActor {
	constructor() {
		this.alive = true;
		this.cleared = 0;
		this.distance = 4;
		this.group = new Group();
		this.profile = { id: 'integrity-shadow', name: 'Integrity Shadow' };
		this.targeted = 0;
	}

	clear() {
		this.cleared += 1;
	}

	payload() {
		return { alive: this.alive, id: this.profile.id };
	}

	target() {
		this.targeted += 1;
	}
}

export function integrityModernPopulation(actor) {
	return {
		actors: [actor],
		activateCandidate(candidate) {
			this.selected = candidate;
			candidate.target();
		},
		candidateFromPointer: () => actor,
		clearAll() {
			this.selected?.clear?.();
			this.selected = null;
		}
	};
}

export function integrityVegetationCell() {
	const group = new Group();
	group.add(new Group(), new Group());
	group.quaternion.set(0.2, 0.1, 0.3, 0.9);
	return { group, reaction: 0, x: 1, z: 1 };
}

export function integrityTreeMaterials() {
	return {
		bark: { color: '#654321' },
		cacheKey: 'integrity-tree-materials',
		leaf: { color: '#3f7f43' }
	};
}
