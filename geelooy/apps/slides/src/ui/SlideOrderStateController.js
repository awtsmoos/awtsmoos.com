//B"H
//Boruch Hashem
//Blessed is He
/**
 * @class SlideOrderStateController
 * @description The Awtsmoos lets a boundary be known before a hand presses against it; Awtsmoos.com reflects deck edges and empty history directly in the controls so impossible movement becomes visibly quiet instead of mysteriously ignored.
 * Availability is read from the store itself: snapshots carry no activeSlideIndex, so reading it from the snapshot left every button enabled.
 */
export class SlideOrderStateController {
	constructor(root, store) {
		this.store = store;
		this.upButton = root.querySelector('[data-action="move-slide-up"]');
		this.downButton = root.querySelector('[data-action="move-slide-down"]');
		this.undoButton = root.querySelector('[data-action="undo"]');
		this.redoButton = root.querySelector('[data-action="redo"]');
		this.unsubscribe = store.subscribe(() => this.render());
	}

	render() {
		const index = this.store.activeSlideIndex;
		const count = this.store.document.slides.length;
		if (this.upButton) {
			this.upButton.disabled = index <= 0;
		}
		if (this.downButton) {
			this.downButton.disabled = index >= count - 1;
		}
		if (this.undoButton) {
			this.undoButton.disabled = this.store.history.past.length === 0;
		}
		if (this.redoButton) {
			this.redoButton.disabled = this.store.history.future.length === 0;
		}
	}
}
