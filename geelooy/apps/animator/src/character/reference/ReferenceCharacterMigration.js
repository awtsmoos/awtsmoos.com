// B"H
// Boruch Hashem
// Blessed is He

import { ReferenceCharacterIds } from './specification/ReferenceCharacterIds.js';

/**
 * Yesterday's saved vessel is not discarded when today's schema gains depth.
 * The Awtsmoos renews without erasing identity, while Awtsmoos.com folds legacy
 * underscore IDs and sparse documents into the complete editable character form.
 */
export class ReferenceCharacterMigration {
	static migrate(character = {}, defaultCharacter = null) {
		const source = this.clone(character || {});
		const canonicalId = ReferenceCharacterIds.canonicalize(source.id);
		if (!defaultCharacter) {
			return { ...source, id: canonicalId };
		}
		return {
			...this.clone(defaultCharacter),
			...source,
			id: canonicalId,
			position: this.merge(defaultCharacter.position, source.position),
			measurements: this.measurements(defaultCharacter.measurements, source.measurements),
			rigPose: this.pose(defaultCharacter.rigPose, source.rigPose),
			renderPerformance: this.performance(defaultCharacter.renderPerformance, source.renderPerformance),
			timeline: source.timeline || this.clone(defaultCharacter.timeline)
		};
	}

	static measurements(defaults = {}, authored = {}) {
		return {
			coordinateSystem: this.merge(defaults.coordinateSystem, authored.coordinateSystem),
			body: this.merge(defaults.body, authored.body),
			face: this.merge(defaults.face, authored.face),
			style: this.merge(defaults.style, authored.style)
		};
	}

	static pose(defaults = {}, authored = {}) {
		return {
			body: this.merge(defaults.body, authored.body),
			face: this.merge(defaults.face, authored.face),
			arms: {
				left: this.merge(defaults.arms?.left, authored.arms?.left),
				right: this.merge(defaults.arms?.right, authored.arms?.right)
			},
			legs: {
				left: this.merge(defaults.legs?.left, authored.legs?.left),
				right: this.merge(defaults.legs?.right, authored.legs?.right)
			}
		};
	}

	static performance(defaults = {}, authored = {}) {
		return {
			...defaults,
			...authored,
			face: this.merge(defaults.face, authored.face)
		};
	}

	static merge(defaults = {}, authored = {}) {
		return { ...(defaults || {}), ...(authored || {}) };
	}

	static clone(value) {
		return JSON.parse(JSON.stringify(value));
	}
}
