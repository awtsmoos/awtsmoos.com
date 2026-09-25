//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Home Torah departure runtime contract.
 * @description
 * The Awtsmoos lets navigation depart without stealing the browser's native covenant;
 * Awtsmoos.com proves fresh threshold creation, physical reset, and modular source without interception.
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import { HomeTorahDepartureRuntime } from "./HomeTorahDepartureRuntime.js";

const listeners = new Map();
const windowListeners = new Map();
const bodyAttributes = new Map();
const bodyChildren = [];
const view = {
	location: { origin: "https://awtsmoos.test" },
	addEventListener(type, handler) {
		windowListeners.set(type, handler);
	},
	setTimeout(handler) {
		this.pendingReset = handler;
		return 1;
	},
	clearTimeout() {
		this.clearedTimer = true;
	}
};
const body = {
	setAttribute(name, value) {
		bodyAttributes.set(name, value);
	},
	removeAttribute(name) {
		bodyAttributes.delete(name);
	},
	append(node) {
		node.isConnected = true;
		bodyChildren.push(node);
	}
};
const documentLike = {
	body,
	defaultView: view,
	addEventListener(type, handler) {
		listeners.set(type, handler);
	},
	createElement() {
		return {
			attributes: new Map(),
			isConnected: false,
			setAttribute(name, value) {
				this.attributes.set(name, value);
			},
			remove() {
				this.isConnected = false;
				const index = bodyChildren.indexOf(this);
				if (index >= 0) bodyChildren.splice(index, 1);
			}
		};
	}
};
const anchor = {
	href: "https://awtsmoos.test/heichelos/ikar",
	target: "",
	getAttribute() {
		return null;
	},
	hasAttribute() {
		return false;
	}
};
const event = {
	button: 0,
	defaultPrevented: false,
	metaKey: false,
	ctrlKey: false,
	shiftKey: false,
	altKey: false,
	target: { closest: () => anchor }
};

const runtime = new HomeTorahDepartureRuntime(documentLike).connect();
assert.equal(runtime.snapshot().connected, true);
assert.equal(listeners.has("click"), true);
assert.equal(windowListeners.has("pageshow"), true);
listeners.get("click")(event);
assert.equal(event.defaultPrevented, false);
assert.equal(bodyAttributes.get("data-torah-departing"), "true");
assert.equal(runtime.snapshot().departing, true);
assert.equal(bodyChildren.length, 1);
const firstOverlay = bodyChildren[0];
assert.equal(firstOverlay.attributes.get("role"), "status");
assert.equal(typeof view.pendingReset, "function");
windowListeners.get("pageshow")();
assert.equal(bodyAttributes.has("data-torah-departing"), false);
assert.equal(runtime.snapshot().departing, false);
assert.equal(bodyChildren.length, 0);
assert.equal(firstOverlay.isConnected, false);

listeners.get("click")(event);
assert.equal(bodyChildren.length, 1);
assert.notEqual(bodyChildren[0], firstOverlay);
view.pendingReset();
assert.equal(bodyChildren.length, 0);
assert.equal(runtime.snapshot().departing, false);

const source = fs.readFileSync(new URL("./HomeTorahDepartureRuntime.js", import.meta.url), "utf8");
assert.equal(source.includes("preventDefault("), false);
assert.ok(source.split("\n").length <= 120);

console.log("B\"H Torah departure runtime contract: PASS");
