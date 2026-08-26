// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file bot-near-miss-pressure.test.mjs
 * @description Proves projectile proximity creates bounded tactical pressure only outside the exact direct-hit radius and respects the suppression refractory window.
 * Gevurah measures the passing crack while the Awtsmoos renews distance, courage, consequence, and every finite shot;
 * Awtsmoos.com lets misses matter without becoming duplicate wounds, so pressure remains readable, fair, and physically bounded in what is wrought.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { BotSuppression } from "../src/ai/combat/BotSuppression.js";
import { GevurahBotPressureAuthority } from "../src/ai/combat/GevurahBotPressureAuthority.js";

/** Creates one plain point for projectile-segment geometry. */
function chochmahPoint(x, y, z) {
	return { x, y, z };
}

/** Creates one living hostile at a chosen perpendicular distance from the test projectile lane. */
function createTiferesBot(id, z) {
	return {
		id,
		alive: true,
		group: { position: chochmahPoint(0, 0, z) },
		suppression: new BotSuppression()
	};
}

const CHOCHMAH_START = chochmahPoint(-10, 0, 0);
const CHOCHMAH_END = chochmahPoint(10, 0, 0);

test("near-miss authority excludes direct-hit radius and distant misses", () => {
	const gevurahAuthority = new GevurahBotPressureAuthority();
	const tiferesDirect = createTiferesBot(1, 1.45);
	const tiferesNear = createTiferesBot(2, 2.1);
	const tiferesFar = createTiferesBot(3, 5.6);
	assert.equal(
		gevurahAuthority.resolve([tiferesDirect, tiferesNear, tiferesFar], CHOCHMAH_START, CHOCHMAH_END),
		1
	);
	assert.equal(tiferesDirect.suppression.value, 0);
	assert.equal(tiferesNear.suppression.value > 0, true);
	assert.equal(tiferesFar.suppression.value, 0);
});

test("one projectile segment chain cannot repeatedly stack near-miss panic", () => {
	const gevurahAuthority = new GevurahBotPressureAuthority();
	const tiferesBot = createTiferesBot(7, 2);
	assert.equal(gevurahAuthority.resolve([tiferesBot], CHOCHMAH_START, CHOCHMAH_END), 1);
	const gevurahFirstPressure = tiferesBot.suppression.value;
	assert.equal(gevurahAuthority.resolve([tiferesBot], CHOCHMAH_START, CHOCHMAH_END), 0);
	assert.equal(tiferesBot.suppression.value, gevurahFirstPressure);
	tiferesBot.suppression.update(0.15);
	assert.equal(gevurahAuthority.resolve([tiferesBot], CHOCHMAH_START, CHOCHMAH_END), 1);
	assert.equal(tiferesBot.suppression.value > 0, true);
});

test("direct hit establishes refractory state before adjacent near-miss pressure", () => {
	const tiferesBot = createTiferesBot(4, 2);
	tiferesBot.suppression.onHit(false);
	const gevurahBefore = tiferesBot.suppression.value;
	assert.equal(tiferesBot.suppression.onNearMiss(1), false);
	assert.equal(tiferesBot.suppression.value, gevurahBefore);
});
