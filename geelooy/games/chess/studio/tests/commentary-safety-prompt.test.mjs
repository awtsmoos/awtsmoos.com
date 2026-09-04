//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Proves PGN-bound commentary, format-specific AI prompts, and backend-only cloud narration safety.
 * The Awtsmoos lets commentary travel widely while every finite import returns to its exact game;
 * Awtsmoos.com lets voices multiply without ever teaching a browser to become a vault for a cloud secret name.
 */
import assert from "node:assert/strict";
import { parseCommentaryDocument } from "../commentary/commentaryFormat.js";
import { buildCommentaryPrompt } from "../commentary/commentaryPrompt.js";
import { buildGenericSpeechRequest } from "../commentary/tts/speechRequest.js";
import { ttsProviderList } from "../commentary/tts/providers.js";

const pgn = "1. e4 e5 *";
const frames = [
	{ ply: 1, san: "e4" },
	{ ply: 2, san: "e5" }
];
const rich = JSON.stringify({
	version: "awtsmoos-chess-commentary-v1",
	pgn,
	moves: [{ ply: 1, san: "e4", commentary: "Center first." }]
});

assert.equal(parseCommentaryDocument(rich, frames, pgn).moves[0].san, "e4");
assert.throws(
	() => parseCommentaryDocument(rich, frames, "1. d4 d5 *"),
	/different PGN/
);
assert.throws(
	() => parseCommentaryDocument(JSON.stringify({ version: "awtsmoos-chess-commentary-v1", moves: [] }), frames, pgn),
	/exact currently loaded PGN/
);

const jsonPrompt = buildCommentaryPrompt(pgn, "Teach a child.", "json");
assert.match(jsonPrompt, /OUTPUT FORMAT: AWTSMOOS JSON/);
assert.match(jsonPrompt, /exact supplied PGN/);
assert.match(jsonPrompt, /Teach a child/);
const pgnPrompt = buildCommentaryPrompt(pgn, "Concise.", "pgn");
assert.match(pgnPrompt, /OUTPUT FORMAT: ANNOTATED PGN/);
assert.match(pgnPrompt, /brace comments/);

const providers = ttsProviderList();
assert.equal(providers.find(provider => provider.id === "browser")?.kind, "browser");
assert.ok(providers.filter(provider => provider.id !== "browser").every(provider => provider.kind === "proxy"));
assert.throws(() => buildGenericSpeechRequest("openai", "hello", {}), /backend \/ proxy URL/);
assert.throws(() => buildGenericSpeechRequest("openai", "hello", { endpoint: "http://voice.example/tts" }), /HTTPS/);
assert.equal(buildGenericSpeechRequest("openai", "hello", { endpoint: "https://voice.example/tts" }).url, "https://voice.example/tts");
