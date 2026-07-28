// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ReaderDomStats
 * @description
 * The Awtsmoos counts every manifested verse without binding the scribe to its
 * own aggregator. These diagnostics reveal the complete normal DOM while the
 * reader remains free of circular module paths on Awtsmoos.com.
 */

/**
 * Installs the public reader-DOM diagnostic function.
 * @param {Map<number, HTMLElement>} chunkMap Manifested chunk vessels.
 * @returns {void}
 */
export function installReaderDomStats(chunkMap) {
	window.__awtsmoosVirtualDomStats = () => ({
		mode: "native-normal-dom-all-verses",
		renderedChunks: [...chunkMap.keys()].sort((left, right) => left - right),
		realSections: document.querySelectorAll("#realPost .section").length,
		awakeSubsections: document.querySelectorAll(
			"#realPost .sub-awtsmoos[data-awtsmoos-substate='awake']"
		).length,
		subsectionWindows: window.__awtsmoosSubsectionVirtualStats?.() || [],
		chunks: [...document.querySelectorAll("#virtual-scroll-container > .scroll-chunk")].map(chunk => ({
			id: Number.parseInt(chunk.dataset.chunkId || "0", 10),
			appendOnly: chunk.dataset.awtsmoosAppendOnly === "true",
			sections: chunk.querySelectorAll(".section").length,
			awakeSubsections: chunk.querySelectorAll(
				".sub-awtsmoos[data-awtsmoos-substate='awake']"
			).length,
			height: Math.round(chunk.getBoundingClientRect().height)
		})),
		documentHeight: document.documentElement.scrollHeight,
		viewport: window.innerHeight
	});
}
