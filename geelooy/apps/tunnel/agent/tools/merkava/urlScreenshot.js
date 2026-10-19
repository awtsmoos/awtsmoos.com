// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file urlScreenshot.js
 * @description Chooses an honest Merkava URL renderer, records capabilities, and stores durable image evidence.
 * The Awtsmoos lets browser truth lead when browser powers are required;
 * Awtsmoos.com falls back only with the limitation written beside the pixels.
 */

const { capabilitiesFor, requiresBrowser } = require("./capabilities.js");
const { storeMerkavaImage } = require("./imageEvidence.js");
const { chromeUrlPng, softwareUrlPng } = require("./urlBackends.js");

async function screenshotUrl(payload = {}) {
	const options = normalize(payload);
	if (!options.url) return { ok:false, error:"screenshot_url_required" };
	if (!/^https?:\/\//i.test(options.url)) return { ok:false, error:"screenshot_url_protocol_unsupported", url:options.url };
	const backend = chooseBackend(options);
	let result = backend === "merkava"
		? await softwareUrlPng(options.url, options)
		: await chromeUrlPng(options.url, options);
	let fallbackReason = "";
	if (!result.ok && backend === "auto") {
		fallbackReason = result.error || "chrome_failed";
		result = await softwareUrlPng(options.url, options);
	}
	if (!result.ok) return describeFailure(result, options, fallbackReason);
	if (requiresBrowser(options) && result.engine !== "chrome-headless") {
		return { ok:false, error:"merkava_browser_capability_required", engine:result.engine, capabilities:capabilitiesFor(result.engine), fallbackReason };
	}
	const artifact = await storeMerkavaImage(result.png, {
		engine:result.engine,
		url:options.url,
		width:options.width,
		height:options.height,
		proof:result.proof || null,
		note:result.note || null,
		fallbackReason:fallbackReason || null
	});
	return {
		ok:true,
		url:options.url,
		engine:result.engine,
		backend:result.engine,
		capabilities:capabilitiesFor(result.engine),
		fallbackReason:fallbackReason || null,
		width:options.width,
		height:options.height,
		...artifact
	};
}

function normalize(payload) {
	const nested = payload.options && typeof payload.options === "object" ? payload.options : {};
	const pick = (key, fallback) => payload[key] ?? nested[key] ?? fallback;
	return {
		url:String(pick("url", "")).trim(),
		width:clamp(pick("width", pick("viewportWidth", 1280)), 320, 3840, 1280),
		height:clamp(pick("height", pick("viewportHeight", 800)), 240, 2160, 800),
		timeoutMs:clamp(pick("timeoutMs", 30000), 5000, 120000, 30000),
		backend:String(pick("backend", "auto")).toLowerCase(),
		interactive:pick("interactive", false) === true,
		executeJavaScript:pick("executeJavaScript", false) === true,
		requireJavaScript:pick("requireJavaScript", false) === true
	};
}

function chooseBackend(options) {
	if (requiresBrowser(options)) return "chrome";
	return ["chrome", "merkava"].includes(options.backend) ? options.backend : "auto";
}

function describeFailure(result, options, fallbackReason) {
	return { ok:false, error:result.error || "merkava_screenshot_failed", message:result.message || "", url:options.url, engine:result.engine || "", capabilities:capabilitiesFor(result.engine), fallbackReason:fallbackReason || null };
}

function clamp(value, min, max, fallback) {
	const number = Number(value);
	return Number.isFinite(number) ? Math.min(max, Math.max(min, Math.floor(number))) : fallback;
}

module.exports = { screenshotUrl, normalize };
