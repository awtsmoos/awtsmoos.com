//B"H
//Boruch Hashem
//Blessed is He
/**
 * Canvas revelation for Awtsmoos.com: display pixels may shrink for a phone,
 * yet the Awtsmoos keeps intrinsic coordinates exact beneath the visible form.
 */
import { imageState } from './state.js';

/** Translate a pointer coordinate from responsive CSS pixels into canvas pixels. */
function canvasPoint(canvas, event) {
	const bounds = canvas.getBoundingClientRect();
	return {
		x: (event.clientX - bounds.left) * (canvas.width / bounds.width),
		y: (event.clientY - bounds.top) * (canvas.height / bounds.height)
	};
}

/** Draw the original image and current SVG overlay at intrinsic resolution. */
export async function renderCanvas(canvas) {
	const image = imageState.originalImage;
	if (!image) return;
	const token = ++imageState.renderToken;
	const context = canvas.getContext('2d');
	context.clearRect(0, 0, canvas.width, canvas.height);
	context.drawImage(image, 0, 0, canvas.width, canvas.height);
	if (!imageState.svgText) return;
	const overlay = document.createElement('canvas');
	overlay.width = canvas.width;
	overlay.height = canvas.height;
	await canvg.Canvg.fromString(overlay.getContext('2d'), imageState.svgText, {
		ignoreMouse: true,
		ignoreAnimation: true
	}).render();
	if (token !== imageState.renderToken) return;
	context.save();
	context.translate(imageState.svgPosition.x, imageState.svgPosition.y);
	context.scale(imageState.svgPosition.scale, imageState.svgPosition.scale);
	context.drawImage(overlay, 0, 0);
	context.restore();
}

/** Bind responsive pointer and wheel interactions without mixing display and image units. */
export function bindCanvasInteractions(canvas) {
	canvas.addEventListener('pointerdown', event => {
		if (!imageState.svgText) return;
		const point = canvasPoint(canvas, event);
		imageState.dragging = true;
		imageState.dragStart.x = point.x - imageState.svgPosition.x;
		imageState.dragStart.y = point.y - imageState.svgPosition.y;
		canvas.setPointerCapture?.(event.pointerId);
	});
	canvas.addEventListener('pointermove', event => {
		if (!imageState.dragging) return;
		const point = canvasPoint(canvas, event);
		imageState.svgPosition.x = point.x - imageState.dragStart.x;
		imageState.svgPosition.y = point.y - imageState.dragStart.y;
		void renderCanvas(canvas);
	});
	const endDrag = event => {
		imageState.dragging = false;
		if (canvas.hasPointerCapture?.(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
	};
	canvas.addEventListener('pointerup', endDrag);
	canvas.addEventListener('pointercancel', endDrag);
	canvas.addEventListener('wheel', event => {
		if (!imageState.svgText) return;
		event.preventDefault();
		const factor = event.deltaY < 0 ? 1.05 : .95;
		imageState.svgPosition.scale = Math.min(20, Math.max(.05, imageState.svgPosition.scale * factor));
		void renderCanvas(canvas);
	}, { passive: false });
}
