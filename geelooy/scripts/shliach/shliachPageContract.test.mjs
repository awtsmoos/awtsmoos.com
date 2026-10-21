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
// B"H 2026-10-20 (impl phase 3, wart vi): ShliachPaths.js is authored as
// ESM but ships with a .js extension inside a CommonJS-scoped tree (the
// Shliach pages load it as a browser module), so Node's ESM loader treats
// it as CommonJS and rejects its named exports before any test can run.
// Load the exact shipped bytes through a data: URL to exercise them under
// ESM semantics without touching the production module.
const pathsModule = await import(
	"data:text/javascript;base64," +
	Buffer.from(fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), "ShliachPaths.js"), "utf8")).toString("base64")
);
const { SHLIACH_GPT_URL, buildShliachPromptUrl } = pathsModule;

const HERE = path.dirname(fileURLToPath(import.meta.url));
const GEOLOOY = path.resolve(HERE, "../..");
const LOGO = "https://awtsmoos.com/api/social/drive/public/awtsmoos/file_000000001aa071f5afcedcf09919246e.png?v=c9428e4217";
// The main Shliach page carries the same canonical logo file with the
// cache-bust of e3e2899d5 (drive mime repair); gallery and Home keep the
// original ?v= token for the identical file.
const LOGO_MAIN = "https://awtsmoos.com/api/social/drive/public/awtsmoos/file_000000001aa071f5afcedcf09919246e.png?v=jpegfix20261020";
const BRIDGE = "https://awtsmoos.com/api/social/drive/public/awtsmoos/12_awtsmoos_hat_logo_pilgrim_golden_bridge.png?v=882a15c8f9";
const CODER = "https://awtsmoos.com/api/social/drive/public/awtsmoos/20_jewish_coder_aleph_gateway_portal_city.png?v=e0b9f9934d";
const ROUTES = new Map([
	["Shliach/index.html", "https://awtsmoos.com/Shliach/"],
	["Shliach/prompts/index.html", "https://awtsmoos.com/Shliach/prompts/"],
	["Shliach/poems/index.html", "https://awtsmoos.com/Shliach/poems/"],
	["Shliach/gallery/index.html", "https://awtsmoos.com/Shliach/gallery/"]
]);

// B"H 2026-10-20 (contract reconciliation): a URL is a literal string, not a
// pattern. The artwork URLs carry a "?v=" cache-bust, and an unescaped "?"
// is a regex quantifier, so escaping only "/" could never match them — the
// artwork assertions failed even where the shipped bytes were exactly the
// expected string. Escape URLs the same full way the GPT assertions do.
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
		// cc63e0f27 (perf lane): the main page loads bundle.css — the
		// index.css @import chain flattened into one file; subpages
		// still load index.css itself.
		assert.match(html, relativePath === "Shliach/index.html" ? /\/style\/shliach\/bundle\.css/ : /\/style\/shliach\/index\.css/);
		assert.match(html, /\/scripts\/shliach\/index\.js/);
		assert.match(html, new RegExp(SHLIACH_GPT_URL.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
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

test("Home uses canonical public logo, cached fallback, campaign route, and safe GPT link", () => {
	const home = source("scripts/home-simple/ShliachSpotlightContent.js");
	assert.match(home, literalUrl(LOGO));
	assert.match(home, /\/drive\/assets\/awtsmoos-shliach-logo\.png/);
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
