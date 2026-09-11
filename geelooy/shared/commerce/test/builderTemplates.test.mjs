//B"H
//Boruch Hashem
//Blessed be He

import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { buildProductCommerceModel } from "../model.js";

/** @file builderTemplates.test.mjs @description Proves Drive's universal store exposes real template goods and convenient top-ups. */

test("Drive commerce model includes purchased premium template goods", () => {
	const catalog = { ok: true, skus: [
		{ id: "drive.supporter.spark.001", productId: "drive", kind: "durable_entitlement", pricePerutahs: 50000, available: true },
		{ id: "drive.template.launch.001", productId: "drive", kind: "durable_entitlement", pricePerutahs: 1000000, available: true },
		{ id: "docs.template.fake.001", productId: "docs", kind: "durable_entitlement", pricePerutahs: 1, available: true }
	] };
	const model = buildProductCommerceModel({ id: "drive", title: "Geelooy Sites" }, catalog, { ok: true, entitlements: [] }, { ok: true, wallet: {}, pricing: {} });
	assert.deepEqual(model.offers.map(offer => offer.id), ["drive.supporter.spark.001", "drive.template.launch.001"]);
});

test("universal store offers direct fifty and hundred dollar top-ups", () => {
	const source = fs.readFileSync(new URL("../surface.js", import.meta.url), "utf8");
	assert.match(source, /\[1, 5, 20, 50, 100\]/);
});
