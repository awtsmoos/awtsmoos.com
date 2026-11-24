// B"H
/** Run 04: no heartbeat proof -> never "Connected" in vessel rendering. */
import assert from "node:assert/strict";

class FakeClassList { constructor() { this.items = new Set(); } add(...x) { x.filter(Boolean).forEach(y => this.items.add(y)); } remove(...x) { x.forEach(y => this.items.delete(y)); } contains(x) { return this.items.has(x); } }
class FakeNode { constructor(tag = "div") { this.tag = tag; this.children = []; this.classList = new FakeClassList(); this.attrs = {}; this.dataset = {}; this.textContent = ""; this.value = ""; } append(...c) { this.children.push(...c); } replaceChildren(...c) { this.children = c; } setAttribute(k, v) { this.attrs[k] = String(v); } addEventListener() {} }
globalThis.Node = FakeNode;
globalThis.document = { createElement: t => new FakeNode(t), createTextNode: t => { const n = new FakeNode("#text"); n.textContent = String(t); return n; }, getElementById: () => null };

const { vesselHealth, hasHeartbeatProof } = await import("../../vessels/vesselHealth.js");
const { vesselPresentation } = await import("../vesselPresentation.js");
const { cardState, deviceListCard } = await import("../deviceCards.js");

const unproven = { vesselType: "native-tunnel", connected: true, isAlive: true, health: {} };
assert.equal(hasHeartbeatProof(unproven), false);
assert.equal(vesselHealth(unproven).state, "unknown");
assert.match(vesselHealth(unproven).label, /unproven/i);
assert.equal(vesselPresentation(unproven).status, "Unproven — no heartbeat");
assert.equal(cardState(unproven), "unknown — no heartbeat proof");

const proven = { vesselType: "native-tunnel", connected: true, isAlive: true, health: { heartbeatAt: Date.now() } };
assert.equal(hasHeartbeatProof(proven), true);
assert.equal(vesselPresentation(proven).status, "Connected");
assert.equal(cardState(proven), "connected");
assert.equal(vesselPresentation({ ...proven, presence: "degraded" }).status, "Degraded");

// Fix 6 regression: the list card takes (title, devices) — never an object title.
const text = n => [n.textContent, ...(n.children || []).flatMap(text)].filter(Boolean).join("\n");
const card = deviceListCard("Account devices", [{ tunnelName: "awt-one", access: "owned", ...proven }]);
assert.match(text(card), /Account devices/);
assert.match(text(card), /awt-one · owned · verified · connected/);
assert.doesNotMatch(text(card), /\[object Object\]/);
assert.match(text(deviceListCard("Account devices", [])), /None connected/);
console.log("B'H vessel proof + device list test passed");
