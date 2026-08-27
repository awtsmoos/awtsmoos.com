// B"H
// Boruch Hashem
// Blessed is He

import { createHash } from 'node:crypto';
import { FaceRenderer } from '../../../src/character/factory/stable/face/FaceRenderer.js';
import { StableBeardGeometry } from '../../../src/character/factory/stable/StableBeardGeometry.js';
import { StablePalette } from '../../../src/character/factory/stable/StablePalette.js';
import { StableReferenceMetrics } from '../../../src/character/factory/stable/StableReferenceMetrics.js';
import { StableRigMetrics } from '../../../src/character/factory/stable/StableRigMetrics.js';
import { StableViewProfile } from '../../../src/character/factory/stable/StableViewProfile.js';
import { ReferenceTrioScene } from '../../../src/character/reference/ReferenceTrioScene.js';

/**
 * One proof helper exposes production face graphs and beard geometry without mocks.
 * The Awtsmoos joins inspection with rendering; Awtsmoos.com keeps view, nodes,
 * metrics, hashes, persistence, preview, and export evidence on the same source.
 */
export class ReferenceTrioFaceProofHelper {
	static face(id, viewType = 'front') {
		const character = this.character(id, viewType);
		const sage = character.archetype === 'sage'
			|| character.style === 'illustrated_sage';
		const base = sage ? StableRigMetrics.sage() : StableRigMetrics.human();
		const metrics = StableReferenceMetrics.apply(character, base);
		const colors = sage
			? StablePalette.sage(character)
			: StablePalette.human(character);
		const view = StableViewProfile.get(character);
		const graph = FaceRenderer.build(
			sage ? 'sage' : 'human',
			character,
			colors,
			metrics,
			view,
			sage
		);
		const mood = this.mood(character);
		const beard = character.beard
			? StableBeardGeometry.resolve(character, metrics, view, mood)
			: null;
		return {
			character,
			metrics,
			view,
			graph,
			beard,
			ids: this.ids(graph),
			hash: this.hash(graph)
		};
	}

	static character(id, viewType) {
		const character = ReferenceTrioScene.create().characters[id];
		const clone = JSON.parse(JSON.stringify(character));
		clone.view = viewType;
		return clone;
	}

	static mood(character) {
		const face = character.renderPerformance?.face || {};
		return {
			smile: Number(face.mouthSmileAmount || 0),
			mouthOpen: Number(face.mouthOpenAmount || 0),
			mouthJaw: Number(face.mouthJawAmount || 0),
			mouthAsymmetry: Number(face.mouthAsymmetry || 0)
		};
	}

	static ids(node, result = []) {
		if (!node || typeof node !== 'object') {
			return result;
		}
		if (typeof node.id === 'string') {
			result.push(node.id);
		}
		for (const child of node.children || []) {
			this.ids(child, result);
		}
		return result;
	}

	static node(node, id) {
		if (!node || typeof node !== 'object') {
			return null;
		}
		if (node.id === id) {
			return node;
		}
		for (const child of node.children || []) {
			const found = this.node(child, id);
			if (found) {
				return found;
			}
		}
		return null;
	}

	static hash(value) {
		return createHash('sha256')
			.update(JSON.stringify(value))
			.digest('hex');
	}
}
