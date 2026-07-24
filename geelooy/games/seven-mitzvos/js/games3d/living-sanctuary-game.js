//B"H
//Boruch Hashem
//Blessed is He

import { ThreeGameBase } from './game-base.js';
import { pulseObject, ringPosition } from '../webgl/scene-kit.js';

const TOTAL_CARES = 6;

/**
 * @module LivingSanctuaryGame3d
 * @description
 * One creature is selected for the player and every mistaken care reveals the
 * exact remedy. The Awtsmoos sustains every breath, while this easy Awtsmoos.com
 * sanctuary teaches compassion through six clear, unhurried acts.
 */
export class LivingSanctuaryGame extends ThreeGameBase {
	setup() {
		this.cared = 0;
		this.mistakes = 0;
		this.timer = 15;
		this.selected = null;
		this.needs = ['Feed', 'Heal', 'Calm', 'Shelter'];
		this.cues = { Feed: 'golden hunger', Heal: 'red injury', Calm: 'violet fear', Shelter: 'blue cold' };
		this.animals = [...Array(4).keys()].map(index => {
			const animal = this.addVessel({
				hue: 112 + index * 30,
				position: ringPosition(index, 4, 3.4, 0.65),
				scale: [1.55, 1, 0.9],
				name: `animal-${index + 1}`,
				userData: { type: 'animal', index, phase: index, need: this.newNeed() }
			}, true);
			this.paintNeed(animal);
			return animal;
		});
		this.stage.setCamera([0, 7.4, 10.2], [0, 0.5, 0]);
		const icons = { Feed: '🍎 Feed', Heal: '✚ Heal', Calm: '♥ Calm', Shelter: '⌂ Shelter' };
		this.controls(this.needs.map(need => ({ label: icons[need], run: () => this.care(need) })));
		this.selectAnimal(this.animals[0]);
		this.renderHud();
	}

	newNeed() {
		return this.needs[this.random(this.needs.length)];
	}

	selectAnimal(animal) {
		this.selected = animal;
		const need = animal.userData.need;
		this.status(`Creature ${animal.userData.index + 1} shows ${this.cues[need]}. Choose ${need}.`);
	}

	picked(object) {
		if (object.userData.type === 'animal') this.selectAnimal(object);
	}

	care(action) {
		if (!this.selected) {
			this.selectAnimal(this.animals[0]);
			return;
		}
		const need = this.selected.userData.need;
		if (action !== need) {
			this.mistakes += 1;
			this.combo = 1;
			this.status(`Try again—this creature needs ${need}. No stability was lost.`, 'warn');
			this.timer = Math.max(this.timer, 8);
			this.renderHud();
			return;
		}
		this.score += 115 * this.combo;
		this.combo = Math.min(5, this.combo + 1);
		this.cared += 1;
		this.selected.userData.need = this.newNeed();
		this.paintNeed(this.selected);
		if (this.cared >= TOTAL_CARES) {
			const stars = this.mistakes <= 2 ? 3 : this.mistakes <= 5 ? 2 : 1;
			this.finish({ stars, message: 'Six needs were answered with patient, exact compassion.' });
			return;
		}
		this.timer = 15;
		this.selectAnimal(this.animals[this.cared % this.animals.length]);
		this.renderHud();
	}

	paintNeed(animal) {
		const hues = { Feed: 48, Heal: 350, Calm: 286, Shelter: 205 };
		this.factory.setHue(animal, hues[animal.userData.need], 0.62);
		this.factory.setGlow(animal, this.factory.hue(hues[animal.userData.need]).getHex(), 0.95);
	}

	update(delta, elapsed) {
		this.timer -= delta;
		this.animals.forEach(animal => {
			pulseObject(animal, elapsed, animal === this.selected ? 0.14 : 0.04, animal === this.selected ? 7 : 3);
		});
		if (this.timer <= 0) {
			this.timer = 10;
			this.status(`Extra time added. The selected creature still needs ${this.selected.userData.need}.`, 'warn');
		}
		this.renderHud();
	}

	onKey(event) {
		const index = Number(event.key) - 1;
		if (index >= 0 && index < 4) this.care(this.needs[index]);
	}

	renderHud() {
		this.hud({ Care: `${this.cared}/${TOTAL_CARES}`, Hints: this.mistakes, Time: Math.max(0, this.timer).toFixed(0) });
	}
}
