// B"H
// Boruch Hashem
// Blessed is He

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PUBLIC_APPS } from "../scripts/catalog/index.mjs";

/**
 * B"H
 *
 * Witnesses the intentional Awtsmoos.com public-app portfolio independently from
 * its rendered cards. The Awtsmoos renews hidden experiment and public product
 * alike; Awtsmoos.com keeps the marketing boundary explicit so existing folders
 * cannot silently become promises to users merely because code exists on disk.
 */

const appsRoot = path.resolve(
	path.dirname(fileURLToPath(import.meta.url)),
	".."
);

test("public catalog contains exactly twelve intentional apps", () => {
	assert.equal(PUBLIC_APPS.length, 12);
	assert.equal(new Set(PUBLIC_APPS.map(app => app.id)).size, 12);
	assert.equal(new Set(PUBLIC_APPS.map(app => app.href)).size, 12);
});

test("every marketed app points to a real local directory", () => {
	for (const app of PUBLIC_APPS) {
		const doorway = path.resolve(appsRoot, app.href);
		assert.equal(
			fs.existsSync(doorway),
			true,
			`${app.title} missing at ${doorway}`
		);
	}
});

test("Wallet is free infrastructure rather than a paid service", () => {
	const wallet = PUBLIC_APPS.find(app => app.id === "wallet");

	assert.ok(wallet);
	assert.equal(wallet.commerceState, "free");
	assert.match(wallet.commerceLabel, /free/i);
});

test("Rebbe core listening remains explicitly open", () => {
	const rebbe = PUBLIC_APPS.find(app => app.id === "rebbe");

	assert.ok(rebbe);
	assert.equal(rebbe.commerceState, "free");
	assert.match(rebbe.commerceLabel, /open/i);
});

test("all other marketed apps describe planned rather than live commerce", () => {
	const plannedApps = PUBLIC_APPS.filter(app => app.commerceState !== "free");

	assert.equal(plannedApps.length, 10);
	assert.equal(
		plannedApps.every(app => /planned/i.test(app.commerceLabel)),
		true
	);
});
