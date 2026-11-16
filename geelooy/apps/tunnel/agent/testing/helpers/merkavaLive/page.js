// B"H
// Boruch Hashem
// Blessed is He

"use strict";

const assert = require("node:assert/strict");
const Cdp = require("../../../tools/chrome/cdp.js");

/**
 * @file Govern a real Linux Chrome target without touching account secrets.
 * @description The Awtsmoos makes one window witness a real navigation;
 * no invented DOM or stale title shall counterfeit observation.
 */
const PORT = 9222;

/** Bind only the requested target, preserving the user's other open tabs. */
async function bind(targetId) {
	await Cdp.ensurePage(PORT, { chromeTargetId: targetId, timeoutMs: 5000 });
}

/** Run one bounded CDP operation in the bound Chromium process. */
async function call(method, params = {}, timeoutMs = 7000) {
	return Cdp.cdpCall(method, params, timeoutMs, { noReconnect: true });
}

/** Observe the browser's real document without exposing its private contents. */
async function state() {
	const result = await call("Runtime.evaluate", {
		expression: `(() => ({
			url:location.href,
			title:document.title,
			ready:document.readyState,
			inputs:document.querySelectorAll('input').length,
			canvases:document.querySelectorAll('canvas').length
		}))()`,
		returnByValue: true
	});
	return result?.result?.value || {};
}

/** Navigate to HTTPS and wait for a correctly matching, complete document. */
async function navigate(url, match, targetId) {
	assert(url.startsWith("https://"));
	await bind(targetId);
	const started = Date.now();
	await call("Page.navigate", { url }, 9000);
	let latest;
	for (let index = 0; index < 75; index += 1) {
		latest = await state().catch(() => ({}));
		if (latest.url?.includes(match) && latest.ready === "complete") {
			return { ...latest, navigationMs: Date.now() - started };
		}
		await new Promise(resolve => setTimeout(resolve, 200));
	}
	throw new Error(`merkava_real_navigation_failed:${match}:${latest?.url || "missing"}`);
}

/** Ensure a fresh target can be opened and closed through Chrome DevTools. */
async function newTarget() {
	const target = await Cdp.newPage(PORT, "about:blank");
	assert.match(target?.id || "", /^[A-Fa-f0-9]{32}$/);
	return target.id;
}

/** Release only the explicit test-owned tab, leaving user tabs untouched. */
async function closeTarget(targetId) {
	await Cdp.closePage(PORT, targetId);
}

module.exports = { bind, call, closeTarget, navigate, newTarget, state };
