// B"H
// Boruch Hashem
// Blessed is He

import { MovieIds } from '../core/MovieIds.js';

/**
 * @file MovieDirector.js
 * @description Expands sparse AI intent into timed scenes while preserving explicit authored blueprints.
 * The Awtsmoos gives a seed a forest and a beat a living scene; Awtsmoos.com keeps the generated structure inspectable and clean.
 */
export class MovieDirector {
	static scenes(intent = {}) {
		const blueprints = intent.scenes?.length ? intent.scenes : this.defaultBlueprints(intent);
		const duration = Number(intent.duration) || 60000;
		const slice = duration / blueprints.length;
		let cursor = 0;
		return blueprints.map((blueprint, index) => {
			const sceneDuration = Number(blueprint.duration) || slice;
			const scene = {
				...blueprint,
				id: blueprint.id || MovieIds.child('scene', index, blueprint.name),
				start: Number.isFinite(Number(blueprint.start)) ? Number(blueprint.start) : cursor,
				duration: sceneDuration,
				entities: this.entities(blueprint, sceneDuration)
			};
			cursor = scene.start + sceneDuration;
			return scene;
		});
	}

	static entities(blueprint, duration) {
		return (blueprint.entities || blueprint.elements || []).map((entity, index) => ({
			...entity,
			id: entity.id || MovieIds.child(blueprint.id || blueprint.name || 'scene', index, entity.name || entity.kind),
			duration: Number(entity.duration) || duration
		}));
	}

	static defaultBlueprints(intent) {
		const subject = String(intent.subject || intent.goal || 'A living idea');
		return [
			{ name: 'Opening', kind: 'cinematic', dimension: '3d', entities: [{ kind: 'text', content: subject }, { kind: 'particle', name: 'Opening sparks' }] },
			{ name: 'Explain', kind: 'tutorial', dimension: '2d', entities: [{ kind: 'text', content: intent.goal || subject }, { kind: 'arrow' }, { kind: 'callout' }] },
			{ name: 'Measure', kind: 'infographic', dimension: '2d', entities: [{ kind: 'chart', data: intent.data || [3, 7, 5, 9] }, { kind: 'meter' }] },
			{ name: 'Human moment', kind: 'dialogue', dimension: 'hybrid', entities: [{ kind: 'character', name: 'Guide' }, { kind: 'dialogue', content: intent.message || subject }] },
			{ name: 'Finale', kind: 'composite', dimension: 'hybrid', entities: [{ kind: 'shape', name: 'Final form' }, { kind: 'particle', name: 'Final sparks' }, { kind: 'text', content: intent.conclusion || 'Continue creating.' }] }
		];
	}
}
