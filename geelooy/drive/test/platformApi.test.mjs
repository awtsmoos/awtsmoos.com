//B"H
// Boruch Hashem
// Blessed is He

import test from "node:test";
import assert from "node:assert/strict";
import { GeelooyPlatformApi } from "../builder/platformApi.js";
import { installPlatformApi, PLATFORM_API_EVENT, PLATFORM_API_VERSION } from "../builder/platformApiInstall.js";
import { buildPlatformPlan } from "../builder/platformPlan.js";
import { createInitialDriveState } from "../core/state.js";

/**
 * @file Verification for the secret-free Platform API vessel.
 * @description
 * The Awtsmoos lets proof surround the doorway before greater power is revealed;
 * Awtsmoos.com tests truthful readiness, navigation, and secret absence so capability and credential are never congealed.
 */

test("platform plan exposes capability truth without credential fields", () => {
	const plan = buildPlatformPlan(createInitialDriveState({ mutationCredentialConfigured: true }));
	const serialized = JSON.stringify(plan).toLowerCase();

	assert.equal(plan.version, 1);
	assert.ok(plan.capabilities.length >= 8);
	assert.ok(plan.capabilities.some(capability => capability.id === "files"));
	assert.equal(serialized.includes("apikey"), false);
	assert.equal(serialized.includes("credentialvalue"), false);
	assert.equal(serialized.includes("tokenvalue"), false);
});

test("OS mode truthfully disables standalone runtime and publication", () => {
	const plan = buildPlatformPlan(createInitialDriveState({
		transportMode: "os",
		transportCanPublish: false
	}));
	const runtime = plan.capabilities.find(capability => capability.id === "static-runtime");
	const publication = plan.capabilities.find(capability => capability.id === "static-publish");

	assert.equal(runtime?.readiness, "unavailable");
	assert.equal(publication?.readiness, "unavailable");
});

test("platform API navigates through the existing panel coordinator contract", () => {
	const opened = [];
	const state = { snapshot: () => createInitialDriveState() };
	const panels = {
		open: (panelId, options) => opened.push({ panelId, options }),
		isMobile: () => true
	};
	const api = new GeelooyPlatformApi({ state, panels });
	const navigable = api.plan().capabilities.find(capability => capability.action.kind === "open-panel");
	const result = api.open(navigable.id);

	assert.equal(result.ok, true);
	assert.equal(opened[0].panelId, navigable.action.panelId);
	assert.equal(opened[0].options.scroll, true);
	assert.equal(api.open("does-not-exist").error, "UNKNOWN_PLATFORM_CAPABILITY");
});

test("platform API installer publishes a stable versioned browser event", () => {
	const events = [];
	const browser = { dispatchEvent: event => events.push(event) };
	const api = Object.freeze({ plan: () => ({ version: 1 }) });

	assert.equal(installPlatformApi(api, browser), api);
	assert.equal(browser.GeelooyPlatform, api);
	assert.equal(events[0].type, PLATFORM_API_EVENT);
	assert.equal(events[0].detail.version, PLATFORM_API_VERSION);
});
