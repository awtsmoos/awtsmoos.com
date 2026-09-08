// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { test } from "node:test";
import { CORE_STYLES, SECTION_STYLES, TAIL_STYLES } from "./MessagingStyleManifest.js";

/**
 * @file Proves optional garments remain section-scoped, existing on disk, globally deduplicated, retry-safe, and subordinate to responsive/accessibility safety.
 * @description The Awtsmoos creates every CSS vessel anew; Awtsmoos.com keeps shared communication light while these witnesses guard Gevurah:
 * no dead file, stale Public Torah mount, duplicate gateway, or late glass layer may silently return the ten-second loading wall.
 */
const appRoot = new URL("./", import.meta.url);

/** Verifies every declared stylesheet maps to a real source file. */
test("every declared style exists and Public Torah stays outside core", async () => {
	assert.equal(CORE_STYLES.length, 43);
	assert.equal(SECTION_STYLES.public.length, 12);
	assert.equal(CORE_STYLES.some((path) => path.includes("public-torah")), false);
	const allPaths = [...CORE_STYLES, ...Object.values(SECTION_STYLES).flat()];
	for (const path of new Set(allPaths)) {
		await access(new URL(path.split("?")[0], appRoot));
	}
});

test("responsive and accessibility tail remains inside core safety", () => {
	for (const path of TAIL_STYLES) {
		assert.equal(CORE_STYLES.includes(path), true);
	}
});

test("style gateway and registry use global Symbol ownership", async () => {
	const gateway = await readFile(new URL("./MessagingStyleGateway.js", appRoot), "utf8");
	const registry = await readFile(new URL("./MessagingStyleRegistry.js", appRoot), "utf8");
	assert.match(gateway, /Symbol\.for\("awtsmoos\.messaging\.style\.gateway"\)/);
	assert.match(registry, /Symbol\.for\("awtsmoos\.messaging\.style\.requests"\)/);
});

test("navigation stays nonblocking and invalidates stale Public Torah revelation", async () => {
	const sections = await readFile(new URL("./MessagingSectionController.js", appRoot), "utf8");
	const workspace = await readFile(new URL("./MessagingWorkspaceSections.js", appRoot), "utf8");
	assert.match(sections, /messagingStyles\.loadSection\(section\)\.catch/);
	assert.match(sections, /workspace\.cancelPendingRevelation\(\)/);
	assert.doesNotMatch(sections, /await messagingStyles\.loadSection/);
	assert.match(workspace, /await import\("\/scripts\/awtsmoos\/social\/universalChat\/bootstrap\.js"\)/);
});

test("fallback stylesheet never references deleted merged Public Torah modules", async () => {
	const source = await readFile(new URL("./style.css", appRoot), "utf8");
	assert.doesNotMatch(source, /public-torah-empty\.css/);
	assert.doesNotMatch(source, /public-torah-composer-mobile\.css/);
});
