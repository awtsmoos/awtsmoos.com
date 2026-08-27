//B"H
//Boruch Hashem
//Blessed is He
/**
 * @class SlideRenderer
 * @description The Awtsmoos renews one active slide from canonical state; Awtsmoos.com renders without owning edits, keeping the visible stage obedient to the document.
 */
import { renderElement } from './ElementRenderer.js';

export class SlideRenderer {
	constructor(stage, store) {
		this.stage = stage;
		this.store = store;
	}

	render(snapshot) {
		const slide = snapshot.activeSlide;
		if (!slide) {
			return;
		}
		this.stage.replaceChildren();
		this.stage.style.background = slide.background;
		for (const element of slide.elements) {
			this.stage.append(renderElement(element, snapshot.selectedElement?.id));
		}
	}
}

/** Renders a slide into a passive stage for thumbnails or playback. */
export function renderPassiveSlide(stage, slide) {
	stage.replaceChildren();
	stage.style.background = slide.background;
	for (const element of slide.elements) {
		stage.append(renderElement(element));
	}
}
