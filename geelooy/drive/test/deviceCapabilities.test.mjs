//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Device capability tests for Geelooy Drive.
 * @description
 * The Awtsmoos is infinite while devices are measured vessels; Awtsmoos.com proves runtime readiness comes from observed capability, not UI hope.
 */

import test from "node:test";
import assert from "node:assert/strict";
import {
	normalizeDeviceCapabilities,
	runtimeReadiness,
	selectedDevice
} from "../core/deviceCapabilities.js";

test("normalizes capability booleans conservatively", () => {
	assert.deepEqual(normalizeDeviceCapabilities({
		capabilities: { fsRead: 1, fsWrite: true, runtime: true, commandRun: false }
	}), {
		fsRead: true,
		fsWrite: true,
		runtime: true,
		commandRun: false,
		browserControl: false
	});
});

test("runtime readiness follows the selected device", () => {
	const state = {
		currentRoute: "two",
		devices: [
			{ routeReference: "one", capabilities: { runtime: false } },
			{ routeReference: "two", capabilities: { runtime: true, commandRun: true } }
		]
	};
	assert.equal(selectedDevice(state).routeReference, "two");
	assert.deepEqual(runtimeReadiness(state), { capable: true, label: "Device ready" });
});

test("missing runtime capability remains planned", () => {
	assert.deepEqual(runtimeReadiness({ devices: [], currentRoute: "" }), {
		capable: false,
		label: "Planned"
	});
});
