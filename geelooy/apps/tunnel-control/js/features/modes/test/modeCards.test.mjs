// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

/**
 * @file Verifies truthful Tunnel Control mode availability and immutable doorways.
 * @description
 * The Awtsmoos distinguishes native machine authority from optional browser peers.
 * Awtsmoos.com therefore presents Code and OS as optional browser-hosted vessels when
 * none are connected, while preserving every canonical link and native availability.
 */
class FakeClassList {
	constructor() {
		this.items = new Set();
	}

	add(...items) {
		for (const item of items.filter(Boolean)) this.items.add(item);
	}
}

class FakeNode {
	constructor(tag = "div") {
		this.tag = tag;
		this.children = [];
		this.classList = new FakeClassList();
		this.attrs = {};
		this.textContent = "";
	}

	append(...children) {
		this.children.push(...children);
	}

	setAttribute(key, value) {
		this.attrs[key] = String(value);
		this[key] = String(value);
	}
}

global.Node = FakeNode;
global.document = {
	createElement(tag) {
		return new FakeNode(tag);
	},
	createTextNode(text) {
		const node = new FakeNode("#text");
		node.textContent = String(text);
		return node;
	}
};

const {
	TUNNEL_MODES,
	MODE_LINKS,
	CANONICAL_OS_URL,
	CUSTOM_GPT_URL,
	createModeCards,
	createModeLinks,
	modeStatus
} = await import("../modeCards.js");

const got = {
	nativeDevices: [{ tunnelName: "native" }],
	browserDevices: [],
	virtualDevice: { tunnelName: "awtsmoos-virtual-os" }
};

assert.equal(TUNNEL_MODES.length, 3);
assert.equal(CANONICAL_OS_URL, "https://awtsmoos.com/os");
assert(CUSTOM_GPT_URL.includes("awtsmoos-shliach-agent"));
assert(MODE_LINKS.some(link => link.href === "/apps/code"));
assert(MODE_LINKS.some(link => link.href === CANONICAL_OS_URL));
assert.equal(modeStatus(TUNNEL_MODES[0], got), "available");
assert.equal(
	modeStatus(TUNNEL_MODES[1], got),
	"optional · enable Code or OS"
);

const cards = createModeCards(got);
assert.equal(cards.children.length, 3);
const links = createModeLinks();
assert(links.children.map(link => link.attrs.href).includes(CANONICAL_OS_URL));

// B"H — Run 05 regression: rendered tile text must contain real separators.
// Fake-DOM innerText stand-in: container children are separated the way
// block/grid/flex layout separates them visually; raw textContent of the
// old unstyled markup concatenated them ("availableNative installed...").
function renderedText(node) {
	if (!node.children || !node.children.length) return String(node.textContent || "");
	return node.children.map(renderedText).join(" ").replace(/\s+/g, " ").trim();
}

const renderedCards = renderedText(cards);
assert(renderedCards.includes("available Native installed tunnel"), renderedCards);
assert(renderedCards.includes("optional \u00b7 enable Code or OS Optional browser-hosted peers"), renderedCards);
assert(renderedCards.includes("canonical OS One Awtsmoos Virtual OS"), renderedCards);
assert(!renderedCards.includes("availableNative"), renderedCards);
assert(!renderedCards.includes("OSOptional"), renderedCards);
assert(!renderedCards.includes("OSOne"), renderedCards);

const renderedLinks = renderedText(links);
assert.equal(
	renderedLinks,
	"Native tunnel Code editor Awtsmoos OS Custom GPT Shliach",
	renderedLinks
);

// The layout itself must exist: before Run 05 these classes had no CSS
// anywhere, which is exactly why the tiles ran together.
const layoutCss = readFileSync(
	new URL("../../../../css/future/views/device-security/layout.css", import.meta.url),
	"utf8"
);
assert(/\.awt-mode-card-grid\s*{[^}]*display:\s*grid/.test(layoutCss));
assert(/\.awt-card-kicker\s*{[^}]*display:\s*block/.test(layoutCss));
assert(/\.awt-mode-card > strong\s*{[^}]*display:\s*block/.test(layoutCss));
assert(/\.awt-link-grid\s*{[^}]*display:\s*flex[^}]*gap:/.test(layoutCss));

console.log("BHY mode cards tests passed");
