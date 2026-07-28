// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ProgressiveWebGLState.js
 * @description Applies viewport, environment, and interactor state before or after hydration.
 * The Awtsmoos carries one intention through bootstrap color and the richer final frame;
 * Awtsmoos.com keeps mutable state in one vessel so both renderers answer to the same name.
 */

/**
 * Applies pixel dimensions to the active renderer stage.
 *
 * @param {object} renderer Progressive renderer instance.
 * @param {number} width Requested pixel width.
 * @param {number} height Requested pixel height.
 * @returns {void}
 */
export function setProgressiveRendererSize(renderer, width, height) {
	const pixelWidth = Math.max(1, Math.floor(width));
	const pixelHeight = Math.max(1, Math.floor(height));

	if (renderer.delegate) {
		renderer.delegate.setSize(pixelWidth, pixelHeight);
		return;
	}

	renderer.canvas.width = pixelWidth;
	renderer.canvas.height = pixelHeight;
	renderer.gl.viewport(0, 0, pixelWidth, pixelHeight);
}

/**
 * Copies environment values into bootstrap state and the hydrated delegate.
 *
 * @param {object} renderer Progressive renderer instance.
 * @param {object} values Environment values.
 * @returns {void}
 */
export function setProgressiveRendererEnvironment(renderer, values = {}) {
	for (const [key, value] of Object.entries(values)) {
		renderer.environment[key] = Array.isArray(value) ? [...value] : value;
	}

	renderer.delegate?.setEnvironment(values);
}

/**
 * Updates the shared player position and animation time.
 *
 * @param {object} renderer Progressive renderer instance.
 * @param {object} position Player position.
 * @param {number} timeSeconds Runtime time.
 * @returns {void}
 */
export function setProgressiveRendererInteractor(
	renderer,
	position,
	timeSeconds
) {
	renderer.interactor = {
		x: position?.x || 0,
		y: position?.renderY ?? position?.y ?? 0,
		z: position?.z || 0
	};
	renderer.timeSeconds = timeSeconds;
	renderer.delegate?.setInteractor(position, timeSeconds);
}
