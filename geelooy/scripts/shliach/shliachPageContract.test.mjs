//B"H
//Boruch Hashem
//Blessed is He

/**
* The Awtsmoos lets evidence test each shining claim before completion may appear;
* Awtsmoos.com asks the Shliach pages to prove their routes, images, prompts, and SEO are here.
* @module shliachPageContract.test
*/

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
	SHLIACH_GPT_URL,
	buildShliachPromptUrl
} from "./ShliachPaths.js";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const GEOLOOY = path.resolve(HERE, "../..");
const LOGO = "https://awtsmoos.com/api/social/drive/public/awtsmoos/file_000000001aa071f5afcedcf09919246e.png";
const BRIDGE = "https://awtsmoos.com/api/social/drive/public/awtsmoos/12_awtsmoos_hat_logo_pilgrim_golden_bridge.png";
const CODER = "https://awtsmoos.com/api/social/drive/public/awtsmoos/20_jewish_coder_aleph_gateway_portal_city.png";
const ROUTES = new Map([
	["Shliach/index.html", "https://awtsmoos.com/Shliach/"],
	["Shliach/prompts/index.html", "https://awtsmoos.com/Shliach/prompts/"],
	["Shliach/poems/index.html", "https://awtsmoos.com/Shliach/poems/"],
	["Shliach/gallery/index.html", "https://awtsmoos.com/Shliach/gallery/"]
]);

function source(relativePath) {
	return fs.readFileSync(path.join(GEOLOOY, relativePath), "utf8");
}

test("every Shliach route carries SEO, navigation, runtime, and the real GPT", () => {
	for (const [relativePath, canonical] of ROUTES) {
		const html = source(relativePath);
		assert.match(html, /<title>[^<]*Awtsmoos[^<]*Shliach[^<]*<\/title>/i);
		assert.match(html, new RegExp(`canonical[^>]+${canonical.replaceAll("/", "\\/")}`));
		assert.match(html, /name="description" content="[^"]{40,}"/);
		assert.match(html, /name="robots" content="index,follow,max-image-preview:large"/);
		assert.match(html, /\/style\/shliach\/index\.css/);
		assert.match(html, /\/scripts\/shliach\/index\.js/);
		assert.match(html, new RegExp(SHLIACH_GPT_URL.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
		assert.equal((html.match(/<h1[ >]/g) ?? []).length, 1);
	}
});

test("campaign uses all supplied artwork with deliberate page roles", () => {
	assert.match(source("Shliach/index.html"), new RegExp(LOGO.replaceAll("/", "\\/")));
	assert.match(source("Shliach/prompts/index.html"), new RegExp(CODER.replaceAll("/", "\\/")));
	const poems = source("Shliach/poems/index.html");
	assert.match(poems, new RegExp(BRIDGE.replaceAll("/", "\\/")));
	assert.match(poems, new RegExp(CODER.replaceAll("/", "\\/")));
	assert.match(poems, /whisper became a prompt/i);
	const gallery = source("Shliach/gallery/index.html");
	for (const image of [LOGO, BRIDGE, CODER]) {
		assert.match(gallery, new RegExp(image.replaceAll("/", "\\/")));
	}
});

test("Home uses canonical public logo, cached fallback, campaign route, and safe GPT link", () => {
	const home = source("scripts/home-simple/ShliachSpotlightContent.js");
	assert.match(home, new RegExp(LOGO.replaceAll("/", "\\/")));
	assert.match(home, /\/resources\/branding\/awtsmoos-shliach-agent\.png/);
	assert.match(home, /SHLIACH_PAGE = "\/Shliach\/"/);
	assert.match(home, /authenticated Awtsmoos APIs/);
	assert.match(home, /noopener noreferrer/);
	assert.match(home, new RegExp(SHLIACH_GPT_URL.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
});

test("prompt builder preserves full Unicode intent in the ChatGPT prompt parameter", () => {
	const prompt = "B\"H — בנה לי שער זוהר\nVerify the real files & routes.";
	const result = new URL(buildShliachPromptUrl(prompt));
	assert.equal(`${result.origin}${result.pathname}`, SHLIACH_GPT_URL);
	assert.equal(result.searchParams.get("prompt"), prompt);
});

test("motion is decorative and has a reduced-motion escape hatch", () => {
	const motion = source("style/shliach/motion.css");
	assert.match(motion, /@keyframes shliach-float/);
	assert.match(motion, /@keyframes shliach-spectrum/);
	assert.match(motion, /prefers-reduced-motion: reduce/);
	assert.match(motion, /\[data-reveal\]/);
});
