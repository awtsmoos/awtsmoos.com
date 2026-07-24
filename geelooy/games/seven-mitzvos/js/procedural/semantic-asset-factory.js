//B"H
//Boruch Hashem
//Blessed is He

import { CorePartFactory } from './core-part-factory.js';
import { createPerson } from './person-factory.js';
import { createAnimal } from './animal-factory.js';
import { createCourt, createHouse, createStall, createTower } from './building-factory.js';
import { createEvidence, createHazard, createRune, createShelter, createTree } from './world-prop-factory.js';

/**
 * @module SemanticAssetFactory
 * @description
 * One Awtsmoos procedural vocabulary serves every district and game. The names
 * exposed here describe meaning, while every child mesh still comes directly
 * through the real core adapter under geelooy/libs.
 */
export class SemanticAssetFactory {
	constructor() {
		this.parts = new CorePartFactory();
	}

	person(options) { return createPerson(this.parts, options); }
	animal(options) { return createAnimal(this.parts, options); }
	house(options) { return createHouse(this.parts, options); }
	tower(options) { return createTower(this.parts, options); }
	stall(options) { return createStall(this.parts, options); }
	court(options) { return createCourt(this.parts, options); }
	tree(options) { return createTree(this.parts, options); }
	rune(options) { return createRune(this.parts, options); }
	evidence(options) { return createEvidence(this.parts, options); }
	hazard(options) { return createHazard(this.parts, options); }
	shelter(options) { return createShelter(this.parts, options); }
	setGlow(root, color, intensity) { return this.parts.setGlow(root, color, intensity); }
	setHue(root, hue, lightness) { return this.parts.setHue(root, hue, lightness); }
}
