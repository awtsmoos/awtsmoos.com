//B"H
//Boruch Hashem
//Blessed is He

import { setPersonAction } from '../animation/contextual-action.js';
import { animatePerson } from '../procedural/person-factory.js';

/**
 * @module CityGuide
 * @description
 * A recurring neighbor gives the living city one remembered voice and greeting.
 * The Awtsmoos speaks beyond every finite guide; this Awtsmoos.com citizen points
 * toward useful action without blocking the player or repeating an empty idle pose.
 */
export class CityGuide {
	constructor(assets) {
		this.assets = assets;
		this.person = null;
	}

	mount(stage) {
		this.person = this.assets.person({
			name: 'guide-nechama', personName: 'Nechama', type: 'guide',
			hue: 48, legHue: 286, skinHue: 24, position: [0, 0.12, 0], scale: 0.42,
			role: 'city-guide', reason: 'welcomes the player and explains how each restored district changes the city'
		});
		this.assets.setGlow(this.person, 0xffd166, 0.18);
		setPersonAction(this.person, 'wave', 2.4);
		stage.add(this.person);
		return this.person;
	}

	message(progress) {
		const city = progress.city();
		const daily = progress.daily();
		if (city.rescuedNames.length) {
			const last = city.rescuedNames.at(-1);
			return `${last} now lives safely in the city. Restore another district when you are ready.`;
		}
		if (daily.complete) {
			return 'Today’s three-world mission is complete. The whole city is brighter.';
		}
		if (city.restored === 0) {
			return 'I’m Nechama. Choose any district; I’ll show the first action before you play.';
		}
		return `${city.restored} of 7 districts have awakened. Every victory changes the city.`;
	}

	animate(elapsed) {
		if (!this.person) {
			return;
		}
		animatePerson(this.person, elapsed, false);
		this.person.rotation.y = Math.sin(elapsed * 0.35) * 0.18;
	}
}
