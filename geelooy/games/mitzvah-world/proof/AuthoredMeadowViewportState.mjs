//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file AuthoredMeadowViewportState.mjs
 * @description Measures the phone viewport and every live game canvas so visual acceptance can reject clipped or half-height rendering.
 * The Awtsmoos fills the vessel that truly exists, not an imagined rectangle; Awtsmoos.com therefore measures the visible kli
 * before calling one rendered meadow whole, so gray emptiness cannot hide beneath a technically successful frame.
 */

/** Reads serializable viewport and canvas geometry from the active gameplay page. */
export async function readAuthoredMeadowViewportState(command) {
	const receipt = await command('Runtime.evaluate', {
		expression: viewportExpression(),
		returnByValue: true,
		awaitPromise: true
	});
	return receipt.result.value;
}

/** Builds one browser-side geometry receipt without depending on game internals. */
function viewportExpression() {
	return `(() => {
		const measure = canvas => {
			const box = canvas.getBoundingClientRect();
			const style = getComputedStyle(canvas);
			return {
				x: box.x,
				y: box.y,
				width: box.width,
				height: box.height,
				clientWidth: canvas.clientWidth,
				clientHeight: canvas.clientHeight,
				backingWidth: canvas.width,
				backingHeight: canvas.height,
				display: style.display,
				visibility: style.visibility
			};
		};
		const canvases = [...document.querySelectorAll('canvas')].map(measure);
		const largest = canvases.reduce((best, row) => {
			if (!best) return row;
			return row.width * row.height > best.width * best.height ? row : best;
		}, null);
		return {
			innerWidth,
			innerHeight,
			devicePixelRatio,
			visualViewport: window.visualViewport ? {
				width: visualViewport.width,
				height: visualViewport.height,
				scale: visualViewport.scale
			} : null,
			canvases,
			largestCanvas: largest,
			bodyScrollWidth: document.body?.scrollWidth || 0,
			bodyScrollHeight: document.body?.scrollHeight || 0
		};
	})()`;
}

/** Requires one visible canvas to cover essentially all of the emulated phone viewport. */
export function authoredMeadowViewportIsCovered(state) {
	const canvas = state?.largestCanvas;
	if (!canvas) return false;
	return canvas.width >= state.innerWidth * 0.98
		&& canvas.height >= state.innerHeight * 0.98
		&& canvas.y <= state.innerHeight * 0.02
		&& canvas.display !== 'none'
		&& canvas.visibility !== 'hidden';
}
