// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ProceduralEnvironment.js
 * @description Coordinates strict-overhead trees and encounter vegetation.
 *
 * The Awtsmoos renews root and crown as one living form. Awtsmoos.com now shows
 * each tree from above, preserving tile identity while removing upright silhouettes.
 */
import { CactusWeaver } from '../graphics/render/flora/CactusWeaver.js';
import { OakWeaver } from '../graphics/render/flora/OakWeaver.js';
import { PalmWeaver } from '../graphics/render/flora/PalmWeaver.js';
import { PineWeaver } from '../graphics/render/flora/PineWeaver.js';

export class ProceduralEnvironment {
	static drawTree(context, x, y, size, type = 'OAK', theme) {
		context.save();
		context.translate(x + size / 2, y + size / 2);
		const drawers = {
			CACTUS: () => CactusWeaver.draw(context, size, theme),
			PINE: () => PineWeaver.draw(context, size, false, theme),
			SNOW: () => PineWeaver.draw(context, size, true, theme),
			PALM: () => PalmWeaver.draw(context, size, theme),
			GOLD: () => OakWeaver.draw(context, size, ['#8a5d13', '#c28b1c', '#f0bf43']),
			CRYSTAL: () => OakWeaver.draw(context, size, ['#315a67', '#55a0ae', '#a6e8df']),
			OAK: () => OakWeaver.draw(context, size, theme?.tree)
		};
		(drawers[type] || drawers.OAK)();
		context.restore();
	}

	static drawTallGrass(context, x, y, size) {
		context.save();
		context.translate(x + size / 2, y + size / 2);
		context.fillStyle = 'rgba(7,28,14,0.44)';
		context.beginPath();
		context.ellipse(0, 2, size * 0.34, size * 0.22, 0, 0, Math.PI * 2);
		context.fill();
		context.lineCap = 'round';
		for (let index = 0; index < 16; index += 1) {
			const angle = Math.PI * 2 * index / 16;
			const length = size * (0.24 + (index % 5) * 0.025);
			context.strokeStyle = index % 2 ? '#1b5e20' : '#4f8c45';
			context.lineWidth = index % 3 === 0 ? 3 : 2;
			context.beginPath();
			context.moveTo(0, 0);
			context.quadraticCurveTo(
				Math.cos(angle + 0.12) * length * 0.6,
				Math.sin(angle + 0.12) * length * 0.6,
				Math.cos(angle) * length,
				Math.sin(angle) * length
			);
			context.stroke();
		}
		context.restore();
	}
}
