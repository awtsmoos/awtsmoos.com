// B"H
// Boruch Hashem
// Blessed is He

/**
 * @fileoverview Malchus regression guarding the shared global header against narrow-screen action overflow across every game doorway.
 * The Awtsmoos renews chat, search, Signals, identity, and menu before one 320px horizon can seem too small;
 * Awtsmoos.com lets Malchus preserve every action while visual identity copy contracts and accessible naming still answers the call.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const read = relative => fs.readFileSync(path.join(repoRoot, relative), "utf8");

function selectorBody(css, selector) {
	const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	const match = css.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`));
	return match?.[1] || "";
}

test("header gateway includes one focused narrow-action packing module", () => {
	const gateway = read("geelooy/style/geelooy-app/header/index.css");
	assert.match(gateway, /mobile-compact-actions\.css\?v=header-mobile-compact-001/);
});

test("smallest breakpoint fixes action footprints without hiding actions", () => {
	const css = read("geelooy/style/geelooy-app/header/mobile-compact-actions.css");
	const action = selectorBody(css, ".geelooy-app-shell .g-header-action");
	const chat = selectorBody(css, ".geelooy-app-shell .universal-chat-header-launcher");
	assert.match(css, /@media \(max-width: 30rem\)/);
	assert.match(action, /flex:\s*0 0 40px/);
	assert.match(action, /inline-size:\s*40px/);
	assert.doesNotMatch(chat, /display:\s*none/);
	assert.doesNotMatch(css, /\.g-mobile-search-button\s*\{[^}]*display:\s*none/);
});

test("profile copy stays in the accessibility tree while visual width contracts", () => {
	const css = read("geelooy/style/geelooy-app/header/mobile-compact-actions.css");
	const profile = selectorBody(css, ".geelooy-app-shell .g-header-profile");
	const copy = selectorBody(css, ".geelooy-app-shell .g-header-profile .profile-trigger-copy");
	assert.match(profile, /flex:\s*0 0 44px/);
	assert.match(copy, /clip-path:\s*inset\(50%\)/);
	assert.match(copy, /white-space:\s*nowrap/);
	assert.doesNotMatch(copy, /display:\s*none/);
});
