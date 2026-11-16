// B"H
// Boruch Hashem
// Blessed is He

"use strict";

const assert = require("node:assert/strict");
const path = require("node:path");
const Page = require("./helpers/merkavaLive/page.js");
const Inputs = require("./helpers/merkavaLive/interactions.js");
const Image = require("./helpers/merkavaLive/capture.js");
const Cdp = require("../tools/chrome/cdp.js");

/**
 * @file Real headed Chrome: HTTPS, keyboard, pointer, tabs, WebGL and image IO.
 * @description The Awtsmoos opens authentic pages and seals genuine evidence;
 * only the owner can cross Google's authentication threshold.
 * Execute only on the authorized Linux host with a live private browser.
 */
const ROOT = "/root/ai_thoughts/2026-11-17-merkava-real-browser/live-evidence";

/** Verify all public pages, and leave a separate real Google sign-in tab visible. */
async function run() {
	assert.equal(process.env.AWTSMOOS_MERKAVA_LIVE_TEST, "1", "explicit_live_test_required");
	const report = { realChrome: true, pages: [], input: {}, google: {} };
	const targetId = await Page.newTarget();
	try {
		const example = await Page.navigate("https://example.com", "example.com", targetId);
		assert.match(example.title, /Example Domain/i);
		report.input = {
			...await Inputs.testInputs(targetId),
			...await Inputs.testScroll(targetId)
		};
		const shot = await Image.capture(ROOT, targetId, "png");
		const transferred = await Image.transfer(shot);
		report.pages.push(imageSummary("example.com", example, shot, transferred));
		report.input = { ...report.input, ...await Inputs.testReload(targetId) };

		const google = await Page.navigate("https://www.google.com/", "google.com", targetId);
		const jpeg = await Image.capture(ROOT, targetId, "jpeg", 65);
		const jpegTransport = await Image.transfer(jpeg);
		report.pages.push(imageSummary("www.google.com", google, jpeg, jpegTransport));

		const world = await Page.navigate("https://awtsmoos.com/games/mitzvahWorld",
			"/games/mitzvah-world", targetId);
		const gl = await Page.call("Runtime.evaluate", {
			expression: `(() => {
				const canvas=document.createElement('canvas');
				const context=canvas.getContext('webgl2')||canvas.getContext('webgl');
				return {available:!!context,renderer:context?.getParameter(context.RENDERER)||null,
					pageCanvases:document.querySelectorAll('canvas').length};
			})()`, returnByValue: true
		});
		report.webgl = gl?.result?.value || {};
		const worldShot = await Image.capture(ROOT, targetId, "png");
		const worldTransport = await Image.transfer(worldShot);
		report.pages.push(imageSummary("mitzvah-world", world, worldShot, worldTransport));
		Cdp.dropCurrentSocket();
		await Page.bind(targetId);
		assert((await Page.state()).url?.includes("mitzvah-world"));
		report.disconnectedSocketReconnected = true;
	} finally {
		await Page.closeTarget(targetId).catch(() => {});
	}
	const signInTab = await Page.newTarget();
	const signIn = await Page.navigate("https://accounts.google.com/",
		"accounts.google.com", signInTab);
	report.google = {
		signInPageDisplayed: /sign in|google accounts/i.test(signIn.title),
		title: signIn.title,
		userAuthenticated: false,
		gmailAuthenticated: false,
		ownerActionRequired: true
	};
	assert.equal(report.pages.length, 3);
	return report;
}

/** Preserve only evidence identifiers and timings, never private body text. */
function imageSummary(label, page, shot, transfer) {
	return {
		label,
		pageTitle: page.title,
		navigationMs: page.navigationMs,
		captureMs: shot.captureMs,
		actionMs: shot.captureActionMs,
		transferMs: transfer.transferMs,
		bytes: shot.bytes,
		sha256: shot.sha256,
		width: shot.width,
		height: shot.height,
		contentType: shot.contentType,
		privateEvidence: path.basename(shot.imagePath),
		binaryVerified: shot.sha256 === transfer.sha256
	};
}

run().then(report => {
	console.log(JSON.stringify({ ok: true, ...report }, null, 2));
	Cdp.dropCurrentSocket();
	process.exit(0);
}).catch(error => {
	console.error(JSON.stringify({ ok: false, error: error.stack || error.message }));
	Cdp.dropCurrentSocket();
	process.exit(1);
});
