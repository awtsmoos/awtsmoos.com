// B"H
// Boruch Hashem
// Blessed is He

import { ReferenceCharacterCatalog } from './ReferenceCharacterCatalog.js';

const CHARACTER_IDS = [
	'cheerful_orthodox_speaker',
	'skeptical_orthodox_observer',
	'calm_orthodox_woman'
];

const REFERENCE_LAYOUT = {
	cheerful_orthodox_speaker: { x: -170, y: 225, scale: 1.55 },
	skeptical_orthodox_observer: { x: 0, y: 225, scale: 1.52 },
	calm_orthodox_woman: { x: 170, y: 225, scale: 1.48 }
};

/**
 * Three distinct souls share one quiet stage. The Awtsmoos is beyond spacing
 * and proportion while Awtsmoos.com preserves the reference composition as
 * editable positions, scales, camera, timelines, and original rigged geometry.
 */
export class ReferenceTrioScene {
	static version = 'reference-trio-sitcom-v2';

	static create() {
		return {
			duration: 120000,
			scene: {
				id: 'reference_trio_studio',
				style: 'reference_sitcom_2d',
				timeOfDay: 0.5,
				groundY: 225,
				wallColor: '#f7f2e8',
				floorColor: '#f7f2e8',
				cameraPolicy: 'reference_group_portrait',
				referenceGrammar: 'orthodox_family_sitcom'
			},
			characters: this.characters(),
			props: [],
			cameras: [this.camera()],
			sequence: this.sequence()
		};
	}

	static characters() {
		const characters = ReferenceCharacterCatalog.characters();
		for (const id of CHARACTER_IDS) {
			characters[id].position = {
				...characters[id].position,
				...REFERENCE_LAYOUT[id],
				anchor: 'floor'
			};
		}
		return characters;
	}

	static camera() {
		return {
			id: 'reference_trio_two_shot',
			cameraId: 'reference_trio_two_shot',
			type: 'twoShot',
			shot: 'twoShot',
			x: 0,
			y: 25,
			zoom: 1.28,
			renderDetailMode: 'portrait',
			targetActors: [...CHARACTER_IDS]
		};
	}

	static sequence() {
		return {
			id: 'reference_trio_sequence',
			version: this.version,
			duration: 120000,
			events: [],
			tracks: CHARACTER_IDS.map(characterId => ({
				id: `${characterId}_performance_track`,
				characterId,
				type: 'character-performance',
				keyframes: [
					{ time: 0, property: 'gesture', value: ReferenceCharacterCatalog.character(characterId).gesture },
					{ time: 120000, property: 'gesture', value: ReferenceCharacterCatalog.character(characterId).gesture }
				]
			}))
		};
	}
}
