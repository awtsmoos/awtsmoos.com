// B"H
// Boruch Hashem
// Blessed is He

/**
 * Physical pixels follow the visible pane until a movie declares its own frame.
 * The Awtsmoos renews both vessels while Awtsmoos.com prevents the responsive
 * guardian from overwriting a production buffer after Studio has locked it.
 */
export class CanvasPixelBuffer {
	static measure(canvas) {
		const rect = canvas?.getBoundingClientRect?.()
			|| { width: 0, height: 0, left: 0, top: 0 };
		const production = this.productionSize(canvas);
		const rawDpr = window.devicePixelRatio || 1;
		const dpr = production
			? 1
			: Math.max(1, Math.min(3, Number.isFinite(rawDpr) ? rawDpr : 1));
		const cssWidth = Math.max(1, rect.width || window.innerWidth || 800);
		const cssHeight = Math.max(1, rect.height || window.innerHeight || 600);
		const pixelWidth = production?.width
			|| Math.max(1, Math.round(cssWidth * dpr));
		const pixelHeight = production?.height
			|| Math.max(1, Math.round(cssHeight * dpr));
		return {
			valid: Boolean(canvas),
			dpr,
			cssWidth,
			cssHeight,
			pixelWidth,
			pixelHeight,
			left: rect.left || 0,
			top: rect.top || 0,
			production: Boolean(production),
			changed: Boolean(canvas)
				&& (canvas.width !== pixelWidth || canvas.height !== pixelHeight)
		};
	}

	static apply(canvas, metrics) {
		if (!canvas || !metrics?.valid) return false;
		const changed = canvas.width !== metrics.pixelWidth
			|| canvas.height !== metrics.pixelHeight;
		if (changed) {
			canvas.width = metrics.pixelWidth;
			canvas.height = metrics.pixelHeight;
		}
		canvas.dataset.awCanvasWidth = String(metrics.pixelWidth);
		canvas.dataset.awCanvasHeight = String(metrics.pixelHeight);
		canvas.dataset.awCssWidth = String(Math.round(metrics.cssWidth));
		canvas.dataset.awCssHeight = String(Math.round(metrics.cssHeight));
		canvas.dataset.awDpr = String(metrics.dpr);
		return changed;
	}

	static productionSize(canvas) {
		const width = Number(canvas?.dataset.awtsmoosProductionWidth || 0);
		const height = Number(canvas?.dataset.awtsmoosProductionHeight || 0);
		return width > 0 && height > 0 ? { width, height } : null;
	}
}
