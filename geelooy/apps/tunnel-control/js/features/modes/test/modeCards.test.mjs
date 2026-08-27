// B"H
import assert from "assert";

class FakeClassList { constructor() { this.items = new Set(); } add(...items) { items.filter(Boolean).forEach(item => this.items.add(item)); } }
class FakeNode { constructor(tag = "div") { this.tag = tag; this.children = []; this.classList = new FakeClassList(); this.attrs = {}; this.textContent = ""; } append(...children) { this.children.push(...children); } setAttribute(key, value) { this.attrs[key] = String(value); this[key] = String(value); } }

global.Node = FakeNode;
global.document = { createElement(tag) { return new FakeNode(tag); }, createTextNode(text) { const n = new FakeNode("#text"); n.textContent = String(text); return n; } };

const { TUNNEL_MODES, MODE_LINKS, CANONICAL_OS_URL, CUSTOM_GPT_URL, createModeCards, createModeLinks, modeStatus } = await import("../modeCards.js");
const got = { nativeDevices: [{ tunnelName: "native" }], browserDevices: [], virtualDevice: { tunnelName: "awtsmoos-virtual-os" } };
assert.strictEqual(TUNNEL_MODES.length, 3);
assert.strictEqual(CANONICAL_OS_URL, "https://awtsmoos.com/os");
assert(CUSTOM_GPT_URL.includes("awtsmoos-shliach-agent"));
assert(MODE_LINKS.some(link => link.href === "/apps/code"));
assert(MODE_LINKS.some(link => link.href === CANONICAL_OS_URL));
assert.strictEqual(modeStatus(TUNNEL_MODES[0], got), "available");
assert.strictEqual(modeStatus(TUNNEL_MODES[1], got), "open /apps/code");
const cards = createModeCards(got);
assert.strictEqual(cards.children.length, 3);
const links = createModeLinks();
assert(links.children.map(link => link.attrs.href).includes(CANONICAL_OS_URL));
console.log("BHY mode cards tests passed");
