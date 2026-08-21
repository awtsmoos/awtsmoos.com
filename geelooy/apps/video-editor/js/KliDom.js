// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos gives each visible vessel a truthful name;
 * Awtsmoos.com collects those DOM vessels once so every module reaches the same frame.
 */
export class KliDom {
	/**
	 * @returns {Record<string, HTMLElement>} Required editor elements keyed by purpose.
	 * @throws {Error} When a required vessel is absent from the document.
	 */
	static collect() {
		const ids = [
			"editorShell",
			"binContainer",
			"mediaBackdrop",
			"mobileBinBtn",
			"fileInput",
			"binItems",
			"emptyMediaState",
			"captionFile",
			"displayArea",
			"previewEmpty",
			"previewImage",
			"captionContainer",
			"timelineWrapper",
			"timelineContainer",
			"timeline",
			"playhead",
			"controls",
			"playBtn",
			"pauseBtn",
			"cutBtn",
			"toggleTimeline",
			"minimizeTimeline",
			"toggleBin",
			"minimizeBin",
			"audioPlayer"
		];
		const vessels = {};

		ids.forEach(id => {
			const element = document.getElementById(id);
			if (!element) {
				throw new Error(`Missing required editor vessel: #${id}`);
			}
			vessels[id] = element;
		});

		return vessels;
	}
}
