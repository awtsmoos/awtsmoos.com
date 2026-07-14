//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class AnimalRenderer
 * @description
 * Species-specific geometry receives path direction, wing phase, gait, tail,
 * gaze, following rings, and sanctuary stillness. Awtsmoos.com reveals living
 * variety without realism-heavy assets, beneath the life-giving Awtsmoos.
 */

import { speciesById } from '../wildlife/AnimalCatalog.js';
import {
	drawDeer,
	drawDove,
	drawFirefly,
	drawFox,
	drawOwl
} from './AnimalShapes.js';
import { worldToScreen } from './RenderTransform.js';

const DRAWERS = Object.freeze({
	dove: drawDove,
	deer: drawDeer,
	fox: drawFox,
	owl: drawOwl,
	firefly: drawFirefly
});

export class AnimalRenderer {
	constructor(context) {
		this.context = context;
	}

	draw(animals, camera, reducedMotion = false) {
		for (const animal of animals) {
			if (animal.sheltered) continue;
			this.drawAnimal(animal, camera, reducedMotion);
		}
	}

	drawAnimal(animal, camera, reducedMotion) {
		const traits = speciesById(animal.species);
		const center = worldToScreen({ x: animal.x + 0.5, y: animal.y + 0.5 }, camera);
		const size = camera.tileSize * traits.size * 0.44;
		const phase = reducedMotion ? animal.phase : animal.animationTime;
		const angle = Math.atan2(animal.facing.y, animal.facing.x);
		const context = this.context;
		context.save();
		context.translate(center.x, center.y);
		context.rotate(angle);
		context.fillStyle = traits.color;
		context.strokeStyle = traits.color;
		context.lineWidth = Math.max(1.5, size * 0.13);
		context.lineCap = 'round';
		context.lineJoin = 'round';
		context.shadowColor = traits.color;
		context.shadowBlur = animal.species === 'firefly' ? size * 3 : size * 0.45;
		if (animal.following) this.drawFollowingRing(size, phase);
		(DRAWERS[animal.species] || drawFirefly)(context, size, phase);
		context.restore();
	}

	drawFollowingRing(size, phase) {
		const context = this.context;
		context.save();
		context.rotate(-phase * 0.35);
		context.strokeStyle = '#fff4ae';
		context.setLineDash([size * 0.35, size * 0.22]);
		context.beginPath();
		context.arc(0, 0, size * 1.55, 0, Math.PI * 2);
		context.stroke();
		context.restore();
	}
}
