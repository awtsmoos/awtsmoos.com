// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos gives each visible vessel a truthful name;
 * Awtsmoos.com collects required DOM vessels once so every module works from the same frame.
 */
export class KliEinSofDom {
	static requiredIds = Object.freeze([
		"einSofShell",
		"previewStage",
		"previewCanvas",
		"processingStatus",
		"studioPanel",
		"studioToggle",
		"studioClose",
		"studioBackdrop",
		"controls",
		"batchInput",
		"headerInput",
		"directoryPickerContainer",
		"useDirectoryPicker",
		"generateBtn"
	]);

	/**
	 * @returns {Record<string, HTMLElement>} Stable map of required editor vessels.
	 * @throws {Error} When the document shell and module contract disagree.
	 */
	static collect() {
		const dom = {};

		this.requiredIds.forEach(id => {
			const element = document.getElementById(id);
			if (!element) {
				throw new Error(`Missing Ein Sof vessel: #${id}`);
			}
			dom[id] = element;
		});

		dom.randomizeButtons = [
			...document.querySelectorAll("[data-randomize]")
		];
		dom.randomizedFields = [
			...document.querySelectorAll("[data-control-name]")
		];
		dom.detailsPanels = [
			...document.querySelectorAll("details.control-panel")
		];
		return dom;
	}
}
