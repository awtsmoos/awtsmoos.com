//B"H
//Boruch Hashem
//Blessed is He
/**
 * Reconstruction math for Awtsmoos.com: the Awtsmoos reveals what lies beneath
 * a mask while the tool keeps full-resolution work separate from tiny previews.
 */
import { imageState } from './state.js';

/** Build full-resolution original and transparent-mask pixel sources once. */
export async function buildReconstructionSource() {
	const image = imageState.originalImage;
	const width = image.naturalWidth || image.width;
	const height = image.naturalHeight || image.height;
	const sourceCanvas = document.createElement('canvas');
	sourceCanvas.width = width;
	sourceCanvas.height = height;
	const sourceContext = sourceCanvas.getContext('2d');
	sourceContext.drawImage(image, 0, 0, width, height);
	const maskCanvas = document.createElement('canvas');
	maskCanvas.width = width;
	maskCanvas.height = height;
	const svgCanvas = document.createElement('canvas');
	svgCanvas.width = width;
	svgCanvas.height = height;
	await canvg.Canvg.fromString(svgCanvas.getContext('2d'), imageState.svgText).render();
	const maskContext = maskCanvas.getContext('2d');
	maskContext.translate(imageState.svgPosition.x, imageState.svgPosition.y);
	maskContext.scale(imageState.svgPosition.scale, imageState.svgPosition.scale);
	maskContext.drawImage(svgCanvas, 0, 0);
	return {
		width,
		height,
		original: sourceContext.getImageData(0, 0, width, height),
		mask: maskContext.getImageData(0, 0, width, height),
		maskCanvas
	};
}

/** Downsample the source once so 100 previews do not perform 100 full-image reconstructions. */
export function buildPreviewSource(source, size = 120) {
	const originalCanvas = document.createElement('canvas');
	originalCanvas.width = size;
	originalCanvas.height = size;
	const originalContext = originalCanvas.getContext('2d');
	originalContext.drawImage(imageState.originalImage, 0, 0, size, size);
	const maskCanvas = document.createElement('canvas');
	maskCanvas.width = size;
	maskCanvas.height = size;
	const maskContext = maskCanvas.getContext('2d');
	maskContext.drawImage(source.maskCanvas, 0, 0, source.width, source.height, 0, 0, size, size);
	return {
		width: size,
		height: size,
		original: originalContext.getImageData(0, 0, size, size),
		mask: maskContext.getImageData(0, 0, size, size)
	};
}

/** Reconstruct one alpha strength without mutating the reusable source buffers. */
export function reconstructImageData(source, alpha) {
	const output = new Uint8ClampedArray(source.original.data.length);
	for (let index = 0; index < source.width * source.height; index += 1) {
		const offset = index * 4;
		const masked = source.mask.data[offset + 3] > 128;
		for (let channel = 0; channel < 3; channel += 1) {
			const pixel = source.original.data[offset + channel] / 255;
			const revealed = masked ? (pixel - alpha) / Math.max(1e-6, 1 - alpha) : pixel;
			output[offset + channel] = Math.round(Math.min(1, Math.max(0, revealed)) * 255);
		}
		output[offset + 3] = source.original.data[offset + 3];
	}
	return new ImageData(output, source.width, source.height);
}
