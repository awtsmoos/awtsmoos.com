//B"H
// Boruch Hashem
// Blessed is He

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

const pathsModule = await import(
	"data:text/javascript;base64," +
	Buffer.from(fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), "ShliachPaths.js"), "utf8")).toString("base64")
);
const { SHLIACH_GPT_URL, buildShliachPromptUrl } = pathsModule;

const HERE = path.dirname(fileURLToPath(import.meta.url));
const GEOLOOY = path.resolve(HERE, "../..");
const LOGO = "https://awtsmoos.com/api/social/drive/public/awtsmoos/file_000000001aa071f5afcedcf09919246e.png?v=c9428e4217";
const LOGO_MAIN = "https://awtsmoos.com/api/social/drive/public/awtsmoos/file_000000001aa071f5afcedcf09919246e.png?v=jpegfix20261020";
const BRIDGE = "https://awtsmoos.com/api/social/drive/public/awtsmoos/12_awtsmoos_hat_logo_pilgrim_golden_bridge.png?v=882a15c8f9";
const CODER = "https://awtsmoos.com/api/social/drive/public/awtsmoos/20_jewish_coder_aleph_gateway_portal_city.png?v=e0b9f9934d";
const DEAD_LOCAL_LOGO = "/drive/assets/awtsmoos-shliach-logo.png";
const ROUTES = new Map([
	["Shliach/index.html", "https://awtsmoos.com/Shliach/"],
	["Shliach/prompts/index.html", "https://awtsmoos.com/Shliach/prompts/"],
	["Shliach/poems/index.html", "https://awtsmoos.com/Shliach/poems/"],
	["Shliach/gallery/index.html", "https://awtsmoos.com/Shliach/gallery/"],
	["Shliach/extension/index.html", "https://awtsmoos.com/Shliach/extension/"]
]);

function literalUrl(url) {
	return new RegExp(url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
}

function source(relativePath) {
	return fs.readFileSync(path.join(GEOLOOY, relativePath), "utf8");
}

test("every Shliach route carries SEO, navigation, runtime, and the real GPT", () => {
	for (const [relativePath, canonical] of ROUTES) {
		const html = source(relativePath);
		assert.match(html, /<title>[^<]*Awtsmoos[^<]*Shliach[^<]*<\/title>/i);
		assert.match(html, new RegExp(`canonical[^>]+${literalUrl(canonical).source}`));
		assert.match(html, /name="description" content="[^"]{40,}"/);
		assert.match(html, /name="robots" content="index,follow,max-image-preview:large"/);
		assert.match(html, relativePath === "Shliach/index.html" ? /\/style\/shliach\/bundle\.css/ : /\/style\/shliach\/index\.css/);
		assert.match(html, /\/scripts\/shliach\/index\.js/);
		assert.match(html, literalUrl(SHLIACH_GPT_URL));
		assert.equal((html.match(/<h1[ >]/g) ?? []).length, 1);
	}
});

test("campaign uses all supplied artwork with deliberate page roles", () => {
	assert.match(source("Shliach/index.html"), literalUrl(LOGO_MAIN));
	assert.match(source("Shliach/prompts/index.html"), literalUrl(CODER));
	const poems = source("Shliach/poems/index.html");
	assert.match(poems, literalUrl(BRIDGE));
	assert.match(poems, literalUrl(CODER));
	assert.match(poems, /whisper became a prompt/i);
	const gallery = source("Shliach/gallery/index.html");
	for (const image of [LOGO, BRIDGE, CODER]) {
		assert.match(gallery, literalUrl(image));
	}
});

test("Home uses the verified public logo, text fallback, campaign route, and safe GPT link", () => {
	const home = source("scripts/home-simple/ShliachSpotlightContent.js");
	assert.match(home, literalUrl(LOGO));
	assert.equal(home.includes(DEAD_LOCAL_LOGO), false);
	assert.match(home, /mediaState = "missing"/);
	assert.match(home, /image\.hidden = true/);
	assert.match(home, /fallback\.hidden = false/);
	assert.match(home, /SHLIACH_PAGE = "\/Shliach\/"/);
	assert.match(home, /authenticated Awtsmoos APIs/);
	assert.match(home, /noopener noreferrer/);
	assert.match(home, literalUrl(SHLIACH_GPT_URL));
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
