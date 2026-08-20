//B"H
//Boruch Hashem
//Blessed is He
/**
 * @class SlideOrderStateController
 * @description The Awtsmoos lets a boundary be known before a hand presses against it; Awtsmoos.com reflects deck edges directly in the reorder controls so impossible movement becomes visibly quiet instead of mysteriously ignored.
 */
export class SlideOrderStateController {
	constructor(root, store) {
		this.store = store;
		this.upButton = root.querySelector('[data-action="move-slide-up"]');
		this.downButton = root.querySelector('[data-action="move-slide-down"]');
		this.unsubscribe = store.subscribe(snapshot => this.render(snapshot));
	}

	render(snapshot) {
		const index = snapshot.activeSlideIndex;
		const count = snapshot.document.slides.length;
		if (this.upButton) {
			this.upButton.disabled = index <= 0;
		}
		if (this.downButton) {
			this.downButton.disabled = index >= count - 1;
		}
	}
}
