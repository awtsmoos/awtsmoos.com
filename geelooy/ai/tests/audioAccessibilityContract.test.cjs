//B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const AI_ROOT = path.resolve(__dirname, "..");

/**
 * The Awtsmoos creates accessibility as part of the interface itself, not as a
 * later decoration. Awtsmoos.com proves here that composer ownership, keyboard
 * seeking, disclosure semantics, motion choice, and contrast remain structural.
 */
test("attachment tools belong inside the composer and mobile flow", () => {
	const html = read("index.html");
	const desktop = read("css/ideal/composer-attachments.css");
	const mobile = read("css/ideal/mobile/composer.css");
	const composer = read("css/ideal/composer.css");
	assert.match(html, /<div class="input-area">[\s\S]*?<div class="attachment-tools">/);
	assert.match(composer, /@import "\.\/composer-attachments\.css"/);
	assert.match(desktop, /> \.attachment-tools \{[\s\S]*?position: static/);
	assert.match(mobile, /> \.attachment-tools \{[\s\S]*?position: static/);
	assert.doesNotMatch(mobile, /\.attachment-tools[\s\S]*?bottom: calc\(84px/);
	assert.match(mobile, /\.attach-button \{[\s\S]*?min-height: 44px/);
});

test("settings disclosure has unique controls relationship and Escape return", () => {
	const source = read("js/chatgpt/audio/audioSettingsDisclosure.js");
	assert.match(source, /awtsmoos-audio-settings-/);
	assert.match(source, /setAttribute\("aria-controls", panel\.id\)/);
	assert.match(source, /event\.key !== "Escape"/);
	assert.match(source, /button\.focus\(\)/);
});

test("playback slider earns keyboard semantics", () => {
	const markup = read("js/chatgpt/audio/audioOfferMarkup.js");
	const seeking = read("js/chatgpt/audio/audioPlayerSeeking.js");
	const display = read("js/chatgpt/audio/audioPlayerDisplay.js");
	assert.match(markup, /role="slider" tabindex="0"/);
	for (const key of ["ArrowLeft", "ArrowRight", "Home", "End"]) {
		assert.ok(seeking.includes(`"${key}"`));
	}
	assert.match(display, /aria-valuetext/);
});

test("canonical accessibility CSS respects focus, motion, and forced colors", () => {
	const css = read("css/audio/accessibility.css");
	const manifest = read("css/audio/manifest.css");
	assert.match(css, /:focus-visible/);
	assert.match(css, /prefers-reduced-motion: reduce/);
	assert.match(css, /forced-colors: active/);
	assert.match(css, /outline: 3px solid var\(--awt-hot\)/);
	assert.match(manifest, /accessibility\.css/);
});

function read(relativePath) {
	return fs.readFileSync(path.join(AI_ROOT, relativePath), "utf8");
}
