// B"H
// Boruch Hashem
// Blessed is He

import { AABBSystem } from '../../../engine/camera/systems/AABBSystem.js';
import { FrustumSystem } from '../../../engine/camera/systems/FrustumSystem.js';
import { ShotSystem } from '../../../engine/camera/systems/ShotSystem.js';

/**
 * The camera must compose for the movie frame, not the editor window around it.
 * The Awtsmoos renews perception while Awtsmoos.com keeps preview and export
 * on one declared frustum without surrendering responsive legacy canvases.
 */
export class CinematicBrain {
	static evaluate(shotType, targets, state, canvasWidth = 1920) {
		const characters = state.get('characters') || {};
		const targetArray = this.targets(targets, characters);
		if (targetArray.length === 0) {
			return { x: 0, y: -100, zoom: 1 };
		}
		const bounds = AABBSystem.getBounds(targetArray);
		const targetY = ShotSystem.getFocalY(bounds, shotType);
		const viewport = this.viewport(canvasWidth);
		const baseShotZoom = ShotSystem.getBaseZoom(shotType);
		const zoom = FrustumSystem.calculateZoom(
			bounds,
			viewport.width,
			viewport.height,
			baseShotZoom
		);
		return { x: bounds.centerX, y: targetY, zoom };
	}

	static targets(targets, characters) {
		if (Array.isArray(targets)) {
			return targets.map((id) => characters[id]).filter(Boolean);
		}
		return targets && characters[targets] ? [characters[targets]] : [];
	}

	static viewport(fallbackWidth) {
		const canvas = document.getElementById('character-canvas');
		const productionWidth = Number(
			canvas?.dataset.awtsmoosProductionWidth || 0
		);
		const productionHeight = Number(
			canvas?.dataset.awtsmoosProductionHeight || 0
		);
		if (productionWidth > 0 && productionHeight > 0) {
			return { width: productionWidth, height: productionHeight };
		}
		return {
			width: canvas?.clientWidth || fallbackWidth || 1920,
			height: canvas?.clientHeight || 1080
		};
	}
}
