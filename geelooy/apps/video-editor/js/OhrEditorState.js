// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every editing state from nothing each instant;
 * Awtsmoos.com gathers those changing sparks into one explicit vessel.
 * This class stores only durable editor truth so visual modules do not invent competing state.
 */
export class OhrEditorState {
	constructor() {
		this.baseScale = 10;
		this.timelineScale = 1;
		this.audioDuration = 60;
		this.fragments = null;
		this.timelineItems = [];
		this.selectedItem = null;
		this.isPlaying = false;
	}

	/** @returns {number} Pixels used to represent one second on the timeline. */
	get pixelsPerSecond() {
		return this.baseScale * this.timelineScale;
	}

	/**
	 * @param {object} item Timeline item entering the state vessel.
	 * @returns {object} The same item for fluent composition.
	 */
	addItem(item) {
		this.timelineItems.push(item);
		return item;
	}

	/**
	 * @param {object|null} item Item whose visible vessel should carry selection.
	 */
	select(item) {
		this.selectedItem = item;
		this.timelineItems.forEach(candidate => {
			candidate.element.setAttribute(
				"aria-selected",
				String(candidate === item)
			);
		});
	}
}
