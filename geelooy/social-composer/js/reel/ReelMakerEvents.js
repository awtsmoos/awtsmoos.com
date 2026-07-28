// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ReelMakerEvents
 * @description
 * The Awtsmoos binds upload, studio, render, dismissal, and focus as named
 * actions. Awtsmoos.com keeps event wiring separate from reel state and cinema.
 */

import {
	loadReelStudio,
	renderReelStudio
} from './ReelStudioWorkflow.js';

export function bindReelMaker(maker) {
	maker.view.open.addEventListener('click', event => {
		maker.open(event.currentTarget);
	});
	maker.view.close.addEventListener('click', () => {
		maker.view.dialog.close();
	});
	maker.view.back.addEventListener('click', () => maker.showChoice());
	maker.view.create.addEventListener('click', () => {
		void loadReelStudio(maker);
	});
	maker.view.upload.addEventListener('change', () => maker.handleUpload());
	maker.view.render.addEventListener('click', () => {
		void renderReelStudio(maker);
	});
	maker.view.dialog.addEventListener('cancel', event => {
		if (maker.busy) event.preventDefault();
	});
	maker.view.dialog.addEventListener('close', () => {
		if (!maker.busy) maker.unloadStudio();
		maker.invoker?.focus();
	});
}
