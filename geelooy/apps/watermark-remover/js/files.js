//B"H
//Boruch Hashem
//Blessed is He
/** File gates for Awtsmoos.com, where the Awtsmoos lets image and mask enter one clear vessel. */
import { imageState, isReadyToGenerate } from './state.js';
import { renderCanvas } from './canvas.js';

/** Decode a browser File into an Image and release its temporary object URL. */
function decodeImage(file) {
	return new Promise((resolve, reject) => {
		const url = URL.createObjectURL(file);
		const image = new Image();
		image.onload = () => {
			URL.revokeObjectURL(url);
			resolve(image);
		};
		image.onerror = () => {
			URL.revokeObjectURL(url);
			reject(new Error('Could not decode the selected image.'));
		};
		image.src = url;
	});
}

/** Keep the generate button synchronized with actual loaded state. */
export function syncGenerateButton(button) {
	button.disabled = !isReadyToGenerate();
}

/** Load the original image while preserving intrinsic canvas resolution. */
export async function loadOriginalFile(file, canvas, button) {
	if (!file) return;
	const image = await decodeImage(file);
	imageState.originalImage = image;
	imageState.reconstruction = null;
	canvas.width = image.naturalWidth || image.width;
	canvas.height = image.naturalHeight || image.height;
	await renderCanvas(canvas);
	syncGenerateButton(button);
}

/** Load the SVG mask as text and redraw the current preview. */
export async function loadSvgFile(file, canvas, button) {
	if (!file) return;
	imageState.svgText = await file.text();
	imageState.reconstruction = null;
	await renderCanvas(canvas);
	syncGenerateButton(button);
}
