// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos unites many small vessels into one living editor;
 * Awtsmoos.com keeps composition here so each module can remain simple, testable, and clear.
 */
import { OhrEditorState } from "./OhrEditorState.js";
import { KliDom } from "./KliDom.js";
import { ChesedTimelineScale } from "./ChesedTimelineScale.js";
import { GevurahPanelController } from "./GevurahPanelController.js";
import { TiferesTimelineItem } from "./TiferesTimelineItem.js";
import { NetzachMediaImporter } from "./NetzachMediaImporter.js";
import { HodScrubber } from "./HodScrubber.js";
import { YesodCaptionRenderer } from "./YesodCaptionRenderer.js";
import { MalchusPlaybackController } from "./MalchusPlaybackController.js";

const dom = KliDom.collect();
const state = new OhrEditorState();
const scale = new ChesedTimelineScale(dom, state);

/**
 * @param {object} config Clip timing and media identity.
 * @returns {TiferesTimelineItem} Fully interactive timeline clip.
 */
function createTimelineItem(config) {
	return new TiferesTimelineItem({
		dom,
		state,
		scale,
		...config
	});
}

new GevurahPanelController(dom);
new HodScrubber(dom, scale);
const captions = new YesodCaptionRenderer(dom, state);
new NetzachMediaImporter({
	dom,
	state,
	scale,
	createTimelineItem
});
new MalchusPlaybackController({
	dom,
	state,
	scale,
	captions,
	createTimelineItem
});

window.addEventListener("resize", () => scale.syncWidth());
requestAnimationFrame(() => scale.syncWidth());
