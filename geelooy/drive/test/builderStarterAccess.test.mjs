//B"H
//Boruch Hashem
//Blessed be He

import assert from "node:assert/strict";
import test from "node:test";
import { canUseBuilderStarter, loadBuilderStarterAccess } from "../ui/builderStarterAccess.js";

/** @file builderStarterAccess.test.mjs @description Proves premium starter UI access follows durable Wallet entitlement truth. */

test("specific entitlement unlocks only its premium starter", async () => {
	const fetchImpl = async () => ({
		ok: true,
		json: async () => ({ ok: true, entitlements: [{ skuId: "drive.template.launch.001" }] })
	});
	const access = await loadBuilderStarterAccess(fetchImpl);
	assert.equal(canUseBuilderStarter({ premium: true, skuId: "drive.template.launch.001" }, access), true);
	assert.equal(canUseBuilderStarter({ premium: true, skuId: "drive.template.saas.001" }, access), false);
});

test("bundle entitlement unlocks every premium starter", async () => {
	const fetchImpl = async () => ({
		ok: true,
		json: async () => ({ ok: true, entitlements: [{ key: "drive.template.propack.001" }] })
	});
	const access = await loadBuilderStarterAccess(fetchImpl);
	assert.equal(canUseBuilderStarter({ premium: true, skuId: "drive.template.agency.001" }, access), true);
	assert.equal(canUseBuilderStarter({ premium: false }, access), true);
});
