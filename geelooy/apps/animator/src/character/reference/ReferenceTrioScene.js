// B"H
// Boruch Hashem
// Blessed is He

import { ReferenceCharacterCatalog } from './ReferenceCharacterCatalog.js';
import { ReferenceCharacterIds } from './specification/ReferenceCharacterIds.js';
import { ReferenceCharacterLayout } from './specification/ReferenceCharacterLayout.js';

const DURATION = 120000;
const CHARACTER_IDS = ReferenceCharacterIds.all();

/**
 * Three distinct souls share one quiet stage. The Awtsmoos is beyond spacing
 * and proportion, while Awtsmoos.com preserves the supplied composition as
 * editable positions, scales, camera framing, real keyframes, and rigged form.
 */
export class ReferenceTrioScene {
	static version = 'reference-trio-sitcom-v8';

	static create() {
		return {
			duration: DURATION,
			scene: this.scene(),
			characters: this.characters(),
			props: [],
			cameras: [this.camera()],
			sequence: this.sequence()
		};
	}

	static scene() {
		return {
			id: 'reference-trio-studio',
			style: 'reference_sitcom_2d',
			timeOfDay: 0.5,
			groundY: 304,
			wallColor: '#f7f2e8',
			floorColor: '#f7f2e8',
			cameraPolicy: 'reference_group_portrait',
			referenceGrammar: 'orthodox_family_sitcom'
		};
	}

	static characters() {
		const characters = ReferenceCharacterCatalog.characters();
		for (const id of CHARACTER_IDS) {
			characters[id].position = ReferenceCharacterLayout.position(id);
		}
		return characters;
	}

	static camera() {
		return {
			id: 'reference-trio-medium-group-shot',
			cameraId: 'reference-trio-medium-group-shot',
			type: 'mediumGroupShot',
			shot: 'medium three character groupShot',
			framing: 'medium group portrait',
			x: 0,
			y: 50,
			zoom: 1.32,
			renderDetailMode: 'portrait',
			targetActors: [...CHARACTER_IDS]
		};
	}

	static sequence() {
		return {
			id: 'reference-trio-sequence',
			version: this.version,
			duration: DURATION,
			events: [],
			tracks: CHARACTER_IDS.map(characterId => this.track(characterId))
		};
	}

	static track(characterId) {
		const character = ReferenceCharacterCatalog.character(characterId);
		return {
			id: `${characterId}-performance-track`,
			characterId,
			type: 'character-performance',
			keyframes: character.timeline.tracks.flatMap(track => [
				{ time: 0, property: track.property, value: track.keyframes[0].value },
				{ time: DURATION, property: track.property, value: track.keyframes.at(-1).value }
			])
		};
	}
}
