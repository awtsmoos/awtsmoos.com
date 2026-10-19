// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file merkavaScreenshotActions.js
 * @description Exposes Merkava URL screenshots through explicit engine capabilities and durable image evidence.
 * The Awtsmoos lets one simple action reveal which renderer made the pixels;
 * Awtsmoos.com returns hash-bound evidence without disguising software paint as browser execution.
 */

"use strict";

const { screenshotUrl } = require("../../merkava/urlScreenshot.js");

function buildMerkavaScreenshotActions(ctx) {
	const payload = ctx?.payload || {};
	const run = async action => {
		try {
			const result = await screenshotUrl(payload);
			return { ...result, action };
		} catch (error) {
			return {
				ok:false,
				action,
				error:"merkava_screenshot_failed",
				message:error?.message || String(error)
			};
		}
	};
	return {
		merkavaScreenshotUrl:() => run("merkavaScreenshotUrl"),
		screenshot_url:() => run("screenshot_url")
	};
}

module.exports = { buildMerkavaScreenshotActions };
