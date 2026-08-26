// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file bot-inheritance-architecture.test.mjs
 * @description Guards meaningful hostile inheritance and prevents the authoritative director from regaining hidden-player or respawn responsibilities.
 * The Awtsmoos is one beyond every hierarchy while Awtsmoos.com lets finite inheritance express only truthful is-a contracts;
 * this witness protects Keser runtime stages, Chai→Medaber combatants, and the absence of telepathic director logic.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const ROOT = new URL("../", import.meta.url);

async function hodSource(path) {
	return readFile(new URL(path, ROOT), "utf8");
}

test("runtime stages inherit the real Keser stage contract", async () => {
	for (const path of [
		"src/ai/runtime/TiferesBotCognitionStage.js",
		"src/ai/runtime/TiferesBotFireStage.js",
		"src/ai/runtime/TiferesBotProcession.js",
		"src/ai/runtime/NetzachBotReinforcementStage.js"
	]) {
		assert.match(await hodSource(path), /extends KeserBotStage/);
	}
});

test("Medaber hostile is a genuine living-combatant descendant", async () => {
	const hodMedaber = await hodSource("src/ai/entities/MedaberHostileCombatant.js");
	assert.match(hodMedaber, /extends ChaiBattleEntity/);
});

test("director delegates instead of aiming from hidden player position or respawn timers", async () => {
	const hodDirector = await hodSource("src/ai/BotDirector.js");
	assert.match(hodDirector, /TiferesBotProcession/);
	assert.match(hodDirector, /GevurahBotDamageAuthority/);
	assert.match(hodDirector, /MalchusBotSquadManifestor/);
	assert.doesNotMatch(hodDirector, /player\.position|respawn|reviveBot|Math\.random/);
});
