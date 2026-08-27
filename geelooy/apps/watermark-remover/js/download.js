//B"H
//Boruch Hashem
//Blessed is He
/** Download one chosen revelation on demand, so Awtsmoos.com never hoards 100 full images in memory. */
import { imageState } from './state.js';
import { reconstructImageData } from './reconstruction.js';

/** Reconstruct and download only the selected full-resolution alpha frame. */
export async function downloadReconstruction(alpha) {
	const source = imageState.reconstruction;
	if (!source) return;
	const canvas = document.createElement('canvas');
	canvas.width = source.width;
	canvas.height = source.height;
	canvas.getContext('2d').putImageData(reconstructImageData(source, alpha), 0, 0);
	const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
	if (!blob) throw new Error('Could not encode the reconstructed PNG.');
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = `reconstruction_alpha_${alpha.toFixed(2)}.png`;
	link.click();
	window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
