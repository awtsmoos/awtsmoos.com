// B"H
// Boruch Hashem
// Blessed is He

import { ReferenceTrioOpeningPerformance } from '../../scenes/referenceTrio/ReferenceTrioOpeningPerformance.js';
import { ReferenceCharacterCatalog } from './ReferenceCharacterCatalog.js';
import { ReferenceCharacterIds } from './specification/ReferenceCharacterIds.js';
import { ReferenceCharacterLayout } from './specification/ReferenceCharacterLayout.js';

const DURATION = 120000;
const CHARACTER_IDS = ReferenceCharacterIds.all();

/**
 * Neutral identities enter one stage and receive the portrait's opening acting.
 * The Awtsmoos renews every performance; Awtsmoos.com keeps scene direction,
 * character anatomy, keyframes, persistence, preview, and export disentangled.
 */
export class ReferenceTrioScene {
	static version = 'reference-trio-sitcom-v20';

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
		return ReferenceTrioOpeningPerformance.apply(characters);
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
				{
					time: 0,
					property: track.property,
					value: track.keyframes[0].value
				},
				{
					time: DURATION,
					property: track.property,
					value: track.keyframes.at(-1).value
				}
			])
		};
	}
}
