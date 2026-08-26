// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos tests that Timeline interaction is semantic, localized, scroll-aware, touch-safe, and free of hidden document listeners;
 * on Awtsmoos.com every control receives its own focus and press language, while geometry and behavior never fight across the cascade.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

/** Read one Editor-relative source file as immutable UI contract evidence. */
function sefer(relativePath) {
	return readFileSync(new URL(relativePath, import.meta.url), "utf8");
}

const ohrView = sefer("./src/UI/TimelineView.js");
const ohrRows = sefer("./src/UI/TimelineRowView.js");
const ohrScrub = sefer("./src/UI/TimelineScrubController.js");
const ohrScroll = sefer("./src/UI/TimelineScrollSync.js");
const ohrPanel = sefer("./src/UI/TimelinePanel.js");
const ohrTimelineCss = sefer("./styles/interaction-timeline.css");
const ohrTouchCss = sefer("./styles/timeline-touch.css");
const ohrGenericCss = sefer("./styles/interaction-feedback.css");
const ohrInteractionManifest = sefer("./styles/interactions.css");
const ohrTimelineManifest = sefer("./styles/timeline.css");

test("ruler is a keyboard-focusable slider and play control is a native button", () => {
	assert.match(ohrView, /tag: "button"[\s\S]*id: "btn-play"/);
	assert.match(ohrView, /role: "slider"/);
	assert.match(ohrView, /tabindex: "0"/);
	assert.match(ohrView, /"aria-orientation": "horizontal"/);
});

test("layers and keyframes use semantic native buttons with accessible labels", () => {
	assert.match(ohrRows, /class: "timeline-disclosure"/);
	assert.match(ohrRows, /tag: "button"/);
	assert.match(ohrRows, /"aria-expanded"/);
	assert.match(ohrRows, /class: "timeline-keyframe"/);
	assert.match(ohrRows, /Seek to keyframe at/);
});

test("scrubbing uses pointer capture, horizontal scroll truth, and no document-global listeners", () => {
	assert.match(ohrScrub, /setPointerCapture/);
	assert.match(ohrScrub, /releasePointerCapture/);
	assert.match(ohrScrub, /scrollContainer\.scrollLeft/);
	assert.match(ohrScrub, /ArrowLeft/);
	assert.match(ohrScrub, /ArrowRight/);
	assert.match(ohrScrub, /Home/);
	assert.match(ohrScrub, /End/);
	assert.doesNotMatch(ohrScrub, /document\.addEventListener/);
});

test("vertical layer and track scrolling has one explicit synchronization owner", () => {
	assert.match(ohrScroll, /syncVertical/);
	assert.match(ohrScroll, /scrollTop/);
	assert.match(ohrPanel, /new YesodTimelineScrollSync/);
});

test("Timeline tactile states are localized away from generic Editor feedback", () => {
	assert.match(ohrTimelineCss, /\.timeline-disclosure:hover/);
	assert.match(ohrTimelineCss, /\.timeline-disclosure:active/);
	assert.match(ohrTimelineCss, /\.timeline-disclosure:focus-visible/);
	assert.match(ohrTimelineCss, /\.timeline-keyframe:hover/);
	assert.match(ohrTimelineCss, /\.timeline-keyframe:active/);
	assert.match(ohrTimelineCss, /\.timeline-keyframe:focus-visible/);
	assert.doesNotMatch(ohrGenericCss, /timeline-keyframe|timeline-disclosure|timeline-ruler/);
});

test("touch geometry and stylesheet ownership stay explicit and conflict-resistant", () => {
	assert.match(ohrTouchCss, /@media \(pointer: coarse\)/);
	assert.match(ohrTouchCss, /height:\s*44px/);
	assert.match(ohrInteractionManifest, /interaction-timeline\.css/);
	assert.match(ohrTimelineManifest, /timeline-touch\.css/);
	assert.doesNotMatch(ohrTimelineCss + ohrTouchCss, /!important/);
});
