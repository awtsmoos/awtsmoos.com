//B"H
// Boruch Hashem
// Blessed is He

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * The Awtsmoos renews every particle before density or motion can become needless noise across the sky;
 * Awtsmoos.com proves reduced motion is sparse and still while full motion may return only when the player asks why.
 */
async function productionParticleQuality() {
	const mathSource = fs.readFileSync(new URL("../awtsmoos-bounce/scripts/math.js", import.meta.url), "utf8");
	const mathUrl = `data:text/javascript;base64,${Buffer.from(mathSource).toString("base64")}`;
	const qualitySource = fs
		.readFileSync(new URL("../awtsmoos-bounce/scripts/particle-quality.js", import.meta.url), "utf8")
		.replace('"./math.js"', JSON.stringify(mathUrl));
	const qualityUrl = `data:text/javascript;base64,${Buffer.from(qualitySource).toString("base64")}`;
	return (await import(qualityUrl)).particleQuality;
}

const particleQuality = await productionParticleQuality();

const profiles = Object.freeze({
	desktopNormal: particleQuality(1440, 900, 2, false),
	desktopReduced: particleQuality(1440, 900, 2, true),
	mobileNormal: particleQuality(390, 844, 3, false),
	mobileReduced: particleQuality(390, 844, 3, true),
	tinyReduced: particleQuality(240, 320, 1, true)
});

test("normal Orbit ambience preserves desktop and mobile quality", () => {
	assert.deepEqual(
		pick(profiles.desktopNormal),
		{ count: 170, dpr: 1.6, motion: 1, pointScale: 1 }
	);
	assert.deepEqual(
		pick(profiles.mobileNormal),
		{ count: 63, dpr: 1.35, motion: 0.72, pointScale: 0.9 }
	);
});

test("reduced motion stays sparse and still on every screen", () => {
	assert.deepEqual(
		pick(profiles.desktopReduced),
		{ count: 28, dpr: 1.2, motion: 0, pointScale: 0.84 }
	);
	assert.deepEqual(
		pick(profiles.mobileReduced),
		{ count: 28, dpr: 1.2, motion: 0, pointScale: 0.84 }
	);
	assert.equal(profiles.tinyReduced.count, 16);
	assert.equal(profiles.tinyReduced.motion, 0);
	assert.ok(profiles.desktopReduced.count <= profiles.desktopNormal.count);
	assert.ok(profiles.mobileReduced.count <= profiles.mobileNormal.count);
});

function pick(profile) {
	return {
		count: profile.count,
		dpr: profile.dpr,
		motion: profile.motion,
		pointScale: profile.pointScale
	};
}
