//B"H
//Boruch Hashem
//Blessed is He
/**
 * Preview generation for Awtsmoos.com: the Awtsmoos reveals one hundred paths,
 * yet the browser carries only tiny previews until the user chooses one.
 */
import { imageState, isReadyToGenerate } from './state.js';
import { buildPreviewSource, buildReconstructionSource, reconstructImageData } from './reconstruction.js';
import { downloadReconstruction } from './download.js';

/** Give rendering a turn so long work remains visibly alive. */
function nextPaint() {
	return new Promise(resolve => requestAnimationFrame(resolve));
}

/** Report a failed download where the user can see it. */
function reportDownloadFailure(error, status) {
	console.error(error);
	status.textContent = error?.message || 'Could not download this reconstruction.';
}

/** Build one accessible thumbnail button for an alpha preview. */
function createThumbnail(source, alpha, status) {
	const canvas = document.createElement('canvas');
	canvas.width = source.width;
	canvas.height = source.height;
	canvas.getContext('2d').putImageData(reconstructImageData(source, alpha), 0, 0);
	const button = document.createElement('button');
	button.type = 'button';
	button.className = 'thumb';
	button.setAttribute('aria-label', `Download reconstruction at alpha ${alpha.toFixed(2)}`);
	button.appendChild(canvas);
	const label = document.createElement('span');
	label.className = 'alpha-label';
	label.textContent = `α ${alpha.toFixed(2)}`;
	button.appendChild(label);
	button.addEventListener('click', () => {
		void downloadReconstruction(alpha).catch(error => reportDownloadFailure(error, status));
	});
	return button;
}

/** Generate 100 lightweight previews while retaining only one full source pair. */
export async function generateFrames(thumbs, status, button) {
	if (!isReadyToGenerate()) return;
	button.disabled = true;
	thumbs.replaceChildren();
	status.textContent = 'Preparing mask and image data…';
	try {
		const fullSource = await buildReconstructionSource();
		const previewSource = buildPreviewSource(fullSource);
		fullSource.maskCanvas = null;
		imageState.reconstruction = fullSource;
		const fragment = document.createDocumentFragment();
		for (let step = 0; step < 100; step += 1) {
			const alpha = (step + 1) / 101;
			fragment.appendChild(createThumbnail(previewSource, alpha, status));
			if ((step + 1) % 10 === 0) {
				status.textContent = `Generating previews… ${step + 1}%`;
				await nextPaint();
			}
		}
		thumbs.appendChild(fragment);
		status.textContent = 'Done — choose a preview to download the full-resolution reconstruction.';
	} finally {
		button.disabled = false;
	}
}
