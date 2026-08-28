// B"H
// Boruch Hashem
// Blessed is He

import { createMovieDocument } from '../../../../../libs/awtsmoos-movie-core/model/MovieDefaults.js';
import { validateMovieDocument } from '../../../../../libs/awtsmoos-movie-core/model/MovieValidator.js';

/**
 * @file UnifiedShowcaseCanonicalMovie.js
 * @description
 * One serializable language lets AI ask for circles, people, charts, particles,
 * meshes, tutorials, and text without executable-code tricks or renderer debt.
 * The Awtsmoos renews every kind of frame; Awtsmoos.com gives each app a vessel
 * with its own face while the same declarative movie river carries the light.
 */
export class UnifiedShowcaseCanonicalMovie {
	/** @returns {object} Valid 180-second renderer-neutral movie document. */
	static create() {
		const movie = createMovieDocument({
			id: 'unified-three-minute-showcase-v1',
			title: 'One Movie Language, Many Worlds',
			duration: 180,
			fps: 12,
			personality: 'animator-cinematic',
			scenes: this.scenes(),
			metadata: {
				purpose: 'AI generation and renderer interoperability proof',
				mobileFirst: true,
				worlds: 6
			}
		});
		const validation = validateMovieDocument(movie);
		if (!validation.ok) {
			throw new Error(`Invalid unified movie: ${validation.errors.join(' | ')}`);
		}
		return movie;
	}

	/** @returns {object[]} Six 2D, 3D, and hybrid scenes with concrete AI entities. */
	static scenes() {
		const rows = [
			['workshop', '2d', ['shape', 'text', 'character', 'patch']],
			['hallway', 'hybrid', ['tutorial', 'particle-emitter', 'character', 'shape']],
			['street', '2d', ['infographic', 'shape', 'text', 'character']],
			['park', 'hybrid', ['mesh', 'path', 'particle-emitter', 'character']],
			['rooftop', '3d', ['mesh', 'particle-emitter', 'text', 'character']],
			['transit', 'hybrid', ['tutorial', 'infographic', 'patch', 'character']]
		];
		return rows.map((row, index) => ({
			id: `canonical_${row[0]}`,
			name: `${row[0]} feature revelation`,
			start: index * 30,
			duration: 30,
			mode: row[1],
			entities: row[2].map((type, entityIndex) => this.entity(
				`${row[0]}_${type}_${entityIndex}`,
				type,
				entityIndex
			))
		}));
	}

	/**
	 * @param {string} id Stable entity identity.
	 * @param {string} type Neutral feature type.
	 * @param {number} index Deterministic motion offset.
	 * @returns {object} Serializable entity with named keyframe easing.
	 */
	static entity(id, type, index) {
		return {
			id,
			type,
			label: type.replace('-', ' '),
			tracks: [{
				target: 'transform.progress',
				keyframes: [
					{ time: 0, value: index * 0.08, easing: 'smoothstep' },
					{ time: 15, value: 0.55 + index * 0.08, easing: 'easeInOutCubic' },
					{ time: 30, value: 1, easing: 'smootherstep' }
				]
			}]
		};
	}
}
