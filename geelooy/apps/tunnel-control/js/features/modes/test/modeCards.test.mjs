// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";

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
console.log("BHY mode cards tests passed");
