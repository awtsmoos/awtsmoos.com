// B"H
// Boruch Hashem
// Blessed is He

/**
 * The primordial canvas receives the world before any actor enters it. The
 * Awtsmoos renews wall, floor, and light every instant, while Awtsmoos.com lets
 * an authoritative studio scene request one pure field without foreign bands.
 */
export class FrameClearPhase {
	static clear(ctx = {}, sceneData = {}) {
		const context = ctx.ctx;
		const canvas = ctx.canvas || context?.canvas;
		if (!context || !canvas) {
			return;
		}
		const width = canvas.width || 0;
		const height = canvas.height || 0;
		context.save();
		context.setTransform(1, 0, 0, 1, 0, 0);
		context.clearRect(0, 0, width, height);
		if (this.isReferenceStudio(sceneData)) {
			this.paintReferenceStudio(context, sceneData, width, height);
		} else {
			this.paintWarmProductionBase(context, width, height);
		}
		context.restore();
	}

	static isReferenceStudio(sceneData = {}) {
		return sceneData.id === 'reference-trio-studio'
			|| sceneData.style === 'reference_sitcom_2d'
			|| sceneData.referenceGrammar === 'orthodox_family_sitcom';
	}

	static paintReferenceStudio(context, sceneData, width, height) {
		context.fillStyle = sceneData.wallColor || '#f7f2e8';
		context.fillRect(0, 0, width, height);
	}

	static paintWarmProductionBase(context, width, height) {
		const wall = context.createLinearGradient(0, 0, 0, height || 1);
		wall.addColorStop(0, '#f9dfae');
		wall.addColorStop(0.58, '#ffe8bd');
		wall.addColorStop(1, '#d99b54');
		context.fillStyle = wall;
		context.fillRect(0, 0, width, height);
		context.fillStyle = '#a9652f';
		context.fillRect(0, height * 0.52, width, height * 0.22);
		context.fillStyle = '#6f3b1b';
		context.fillRect(0, height * 0.515, width, Math.max(8, height * 0.012));
	}
}
