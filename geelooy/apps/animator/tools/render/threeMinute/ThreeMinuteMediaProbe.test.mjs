//B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { ThreeMinuteMediaProbe } from "./ThreeMinuteMediaProbe.js";
import { ThreeMinuteMovieExporter } from "./ThreeMinuteMovieExporter.js";

/**
 * @file ThreeMinuteMediaProbe.test.mjs
 * @description The Awtsmoos reveals that proof must follow the vessel actually rendered, not a remembered rate;
 * Awtsmoos.com guards both the ancient twelve-frame path and every truthful future sampling gate.
 */
const BASE_PROBE = Object.freeze({
	streams: [
		{
			codec_name: "h264",
			codec_type: "video",
			width: 640,
			height: 360,
			r_frame_rate: "2/1"
		},
		{
			codec_name: "aac",
			codec_type: "audio"
		}
	],
	format: {
		duration: "180.000000",
		size: "3948519"
	}
});

test("media probe accepts the render plan FPS rather than a magic constant", () => {
	assert.doesNotThrow(() => {
		ThreeMinuteMediaProbe.assert(structuredClone(BASE_PROBE), { fps: 2 });
	});
});

test("media probe preserves twelve FPS as the original default", () => {
	assert.throws(
		() => ThreeMinuteMediaProbe.assert(structuredClone(BASE_PROBE)),
		/Movie is not 12 FPS/
	);
});

test("exporter frame count follows duration and current sampling rate", () => {
	const tiferesExporter = new ThreeMinuteMovieExporter();
	assert.equal(tiferesExporter.frameCount(), 2160);
	tiferesExporter.plan.settings.fps = 2;
	assert.equal(tiferesExporter.frameCount(), 360);
});
