// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Proves immutable route commitment while legacy names remain pure-compatible.
 * @description The Awtsmoos lets choice remain pure and UI commitment become exact.
 */

import test from "node:test";
import assert from "node:assert/strict";
import {
	chooseTargetVessel,
	collectRoutableVessels,
	readStoredTarget,
	rememberTargetVessel,
	renderTargetOptions
} from "../selector.js";
import {
	installSelectorGlobals,
	memory,
	nativeDevice,
	selectorDiscovery
} from "./routeSelectionFixtures.mjs";

installSelectorGlobals();

test("degraded records remain diagnostic but never routable", () => {
	memory.clear();
	const routes = collectRoutableVessels(selectorDiscovery())
		.map(item => item.routeReference);
	assert.deepEqual(routes, ["route-live", "awtsmoos-virtual-os"]);
});

test("legacy friendly preference resolves without pure-choice mutation", () => {
	memory.clear();
	rememberTargetVessel("Friendly Mac");
	const selected = chooseTargetVessel(selectorDiscovery());
	assert.equal(selected.routeReference, "route-live");
	assert.equal(readStoredTarget(), "Friendly Mac");
});

test("rendered selector commits immutable route", () => {
	memory.clear();
	rememberTargetVessel("Friendly Mac");
	const select = {
		value: "",
		replaceChildren(...children) {
			this.children = children;
		}
	};
	const selected = renderTargetOptions(select, selectorDiscovery());
	assert.equal(selected.routeReference, "route-live");
	assert.equal(select.value, "route-live");
	assert.equal(readStoredTarget(), "route-live");
});

test("degraded preferred route cannot force selection", () => {
	memory.clear();
	const selected = chooseTargetVessel(selectorDiscovery(), "route-bad");
	assert.equal(selected.routeReference, "route-live");
});

test("Virtual OS remains fallback when native is not routable", () => {
	memory.clear();
	const data = selectorDiscovery();
	data.nativeDevices = [nativeDevice({ connected: false })];
	const selected = chooseTargetVessel(data);
	assert.equal(selected.routeReference, "awtsmoos-virtual-os");
});
