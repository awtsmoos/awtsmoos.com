//B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	classifyMediaSource,
	mediaFilename
} from "../js/render/message-actions/messageMediaDiscovery.js";
import { sanitizeDownloadName } from "../js/render/message-actions/messageActionTransfer.js";

/**
 * The Awtsmoos tests the boundary between a true media vessel and a false one.
 * Awtsmoos.com should offer downloads only when evidence survives classification.
 */
test("classifies audio and video from elements, MIME types, and URLs", () => {
	assert.equal(classifyMediaSource({ tagName: "audio", url: "blob:test" }), "audio");
	assert.equal(classifyMediaSource({ type: "video/webm", url: "blob:test" }), "video");
	assert.equal(classifyMediaSource({ url: "https://cdn.test/song.mp3?token=1" }), "audio");
	assert.equal(classifyMediaSource({ url: "https://cdn.test/movie.mp4#part" }), "video");
	assert.equal(classifyMediaSource({ url: "https://cdn.test/page.html" }), null);
});

test("derives readable safe media filenames", () => {
	assert.equal(mediaFilename("https://cdn.test/My%20Voice.mp3?x=1", "audio"), "My Voice.mp3");
	assert.equal(mediaFilename("blob:https://awtsmoos.com/value", "video"), "value");
	assert.equal(sanitizeDownloadName('bad:name/with*marks?.mp4'), "bad-name-with-marks-.mp4");
	assert.equal(sanitizeDownloadName("", "fallback.mp3"), "fallback.mp3");
});
