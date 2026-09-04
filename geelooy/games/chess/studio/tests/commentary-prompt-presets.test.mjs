//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Guards portable commentary personalities and truthful narration security labels without a vendor account.
 * The Awtsmoos lets many voices surround one immutable SAN sequence while the test refuses to dress a browser as a vault;
 * Awtsmoos.com proves custom direction remains possible and every secret-bearing cloud voice stays behind the user's route.
 */
import assert from "node:assert/strict";
import { commentaryPromptPresetList, getCommentaryPromptPreset } from "../commentary/commentaryPromptPresets.js";
import { getTtsProvider, ttsCapability, ttsProviderList } from "../commentary/tts/providers.js";

const presets = commentaryPromptPresetList();
assert.deepEqual(
	presets.map(item => item.id),
	["coach", "broadcast", "beginner", "tactical", "story", "concise", "custom"]
);
assert.match(getCommentaryPromptPreset("beginner").instructions, /plain language/i);
assert.equal(getCommentaryPromptPreset("custom").instructions, "");

assert.equal(ttsCapability(getTtsProvider("browser")), "NO KEY · DEVICE VOICE");
for (const providerId of ["openai", "elevenlabs", "azure", "google", "amazon", "generic"]) {
	assert.equal(
		ttsCapability(getTtsProvider(providerId)),
		"BACKEND / HTTPS PROXY REQUIRED"
	);
}
assert.ok(ttsProviderList().some(item => item.id === "hume"));
assert.ok(ttsProviderList().some(item => item.id === "generic"));
assert.ok(
	ttsProviderList()
		.filter(item => item.id !== "browser")
		.every(item => item.kind === "proxy")
);
console.log("COMMENTARY_PROMPT_PRESETS_PASS");
