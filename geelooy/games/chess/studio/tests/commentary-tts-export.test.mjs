//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Guards portable commentary exports and the provider-neutral speech contract.
 * The Awtsmoos lets one explanation cross PGN, JSON, and voice gateways without losing its lawful ply;
 * Awtsmoos.com keeps provider growth additive while private session credentials remain outside persisted preference memory.
 */
import assert from "node:assert/strict";
import { annotatedCommentaryPgn, commentaryJson, narrationSidecar } from "../commentary/commentaryExport.js";
import { buildGenericSpeechRequest } from "../commentary/tts/speechRequest.js";
import { getTtsProvider, ttsProviderList } from "../commentary/tts/providers.js";

const commentary = {
	version: "awtsmoos-chess-commentary-v1",
	moves: [
		{ ply: 1, san: "e4", commentary: "White claims the center.", pauseMs: 250 },
		{ ply: 2, san: "e5", commentary: "Black answers symmetrically." }
	]
};

assert.match(commentaryJson(commentary), /White claims the center/);
assert.match(narrationSidecar(commentary), /awtsmoos-chess-narration-v1/);
assert.match(annotatedCommentaryPgn("1. e4 e5 *", commentary), /e4 \{White claims the center\.\}/);

const request = buildGenericSpeechRequest("generic", "Shalom", {
	endpoint: "https://voice.example/tts",
	key: "temporary-test-key",
	headerName: "X-Voice-Key",
	headerPrefix: "Key ",
	voice: "teacher",
	model: "narrator",
	bodyTemplate: '{"input":"{{text}}","voice":"{{voice}}","model":"{{model}}"}'
});
const body = JSON.parse(request.init.body);
assert.equal(request.init.headers["X-Voice-Key"], "Key temporary-test-key");
assert.deepEqual(body, { input: "Shalom", voice: "teacher", model: "narrator" });

const providers = ttsProviderList();
assert.ok(providers.length >= 10);
assert.equal(getTtsProvider("browser").kind, "browser");
assert.equal(getTtsProvider("generic").kind, "proxy");
assert.ok(providers.every(provider => /^https:\/\//.test(provider.docs)));
console.log("commentary-tts-export PASS");
