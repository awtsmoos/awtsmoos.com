//B"H
//Boruch Hashem
//Blessed is He
import { SanctuaryLife } from './sanctuary-life.js';
import { ThreeGameBase } from './game-base.js';
import { ringPosition } from '../webgl/scene-kit.js';
const TOTAL_CARES = 6;
/**
 * @module LivingSanctuaryGame3d
 * @description
 * Needy animals wander, healthy animals graze, and caregivers approach the selected
 * creature. The Awtsmoos sustains every breath; Awtsmoos.com makes behavior, care,
 * supplies, shelter, and recovery one smoothly inhabited sanctuary.
 */
export class LivingSanctuaryGame extends ThreeGameBase {
	setup() {
		this.totalCares = this.difficulty(TOTAL_CARES, 8, 10);
		this.cared = 0;
		this.mistakes = 0;
		this.timer = 15;
		this.needs = ['Feed', 'Heal', 'Calm', 'Shelter'];
		this.cues = { Feed: 'lowers its head toward food', Heal: 'limps on one side', Calm: 'trembles and hides', Shelter: 'curls toward the cold ground' };
		this.animals = [...Array(4).keys()].map(index => this.createAnimal(index));
		this.addHabitat();
		this.life = new SanctuaryLife(this, this.animals);
		this.stage.setCamera([0, 7.6, 10.5], [0, 0.7, 0]);
		const labels = { Feed: '🍎 Feed', Heal: '✚ Heal', Calm: '♥ Calm', Shelter: '⌂ Shelter' };
		this.controls(this.needs.map(need => ({ label: labels[need], run: () => this.care(need) })));
		this.selectAnimal(this.animals[0]);
		this.guide('caregivers walk toward the animal whose behavior shows need', 'Watch its movement, then choose the matching care.');
		this.renderHud();
	}
	createAnimal(index) {
		const animal = this.assets.animal({
			name: `sanctuary-animal-${index + 1}`, species: index % 2 ? 'sheep' : 'deer',
			hue: 28 + index * 34, position: ringPosition(index, 4, 3.4, 0.12),
			scale: 0.58, type: 'animal', index, phase: index, need: this.newNeed(),
			role: 'care-patient', reason: 'shows a specific need through movement and waits for exact care'
		});
		this.assets.parts.mark(animal, animal.userData);
		this.paintNeed(animal);
		return this.addAsset(animal, true);
	}
	addHabitat() {
		[[-4.8, -2.6], [4.8, -2.6], [-4.8, 2.8], [4.8, 2.8]].forEach((point, index) => {
			this.addAsset(this.assets.tree({ name: `sanctuary-tree-${index}`, position: [point[0], 0.1, point[1]], scale: 0.3, role: 'shade-tree', reason: 'gives recovering animals shelter and a bounded habitat edge' }));
		});
		this.addAsset(this.assets.shelter({ name: 'animal-shelter', position: [0, 0.1, -4.9], scale: 0.45, role: 'animal-shelter', reason: 'protects cold or recovering animals' }));
	}
	newNeed() {
		return this.needs[this.random(this.needs.length)];
	}
	selectAnimal(animal) {
		this.selected = animal;
		this.life?.focus(animal);
		const need = animal.userData.need;
		this.status(`Creature ${animal.userData.index + 1} ${this.cues[need]}. Choose ${need}.`);
	}
	picked(object) {
		if (object.userData.semanticType === 'animal') this.selectAnimal(object);
	}
	care(action) {
		if (!this.selected) return this.selectAnimal(this.animals[0]);
		const need = this.selected.userData.need;
		if (action !== need) {
			this.mistakes += 1;
			this.combo = 1;
			this.status(`Try again. This animal needs ${need}; no stability was lost.`, 'warn');
			this.timer = Math.max(this.timer, 8);
			return this.renderHud();
		}
		this.score += 115 * this.combo;
		this.combo = Math.min(5, this.combo + 1);
		this.cared += 1;
		this.assets.setGlow(this.selected, 0x42ffc1, 0.5);
		if (this.cared >= this.totalCares) {
			const stars = this.mistakes <= 2 ? 3 : this.mistakes <= 5 ? 2 : 1;
			this.finish({ stars, message: 'Caregivers and animals moved together until the whole sanctuary became calm.' });
			return;
		}
		this.selected.userData.need = this.newNeed();
		this.paintNeed(this.selected);
		this.timer = this.difficulty(15, 12, 10);
		this.selectAnimal(this.animals[this.cared % this.animals.length]);
		this.renderHud();
	}
	paintNeed(animal) {
		const hues = { Feed: 48, Heal: 350, Calm: 286, Shelter: 205 };
		this.assets.setHue(animal, hues[animal.userData.need], 0.58);
		this.assets.setGlow(animal, this.assets.parts.color(hues[animal.userData.need], 0.66).getHex(), 0.35);
	}
	update(delta, elapsed) {
		this.timer -= delta;
		this.life.update(delta, elapsed, this.selected, need => this.stateFor(need));
		if (this.timer <= 0) {
			this.timer = 10;
			this.status(`Extra time added. Creature ${this.selected.userData.index + 1} still needs ${this.selected.userData.need}.`, 'warn');
		}
		this.renderHud();
	}
	stateFor(need) {
		return need === 'Heal' ? 'injured' : need === 'Calm' ? 'fear' : 'calm';
	}
	onKey(event) {
		const index = Number(event.key) - 1;
		if (index >= 0 && index < 4) this.care(this.needs[index]);
	}
	renderHud() {
		this.hud({ Care: `${this.cared}/${this.totalCares}`, Hints: this.mistakes, Time: Math.max(0, this.timer).toFixed(0) });
	}
}
