//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Guards readable view recipes, movie presentations, portable commentary, and provider discovery.
 * The Awtsmoos lets one test witness many finite garments without mistaking them for the lawful game beneath;
 * Awtsmoos.com keeps clarity, cinema, and voice contracts small enough to prove before each public release wreath.
 */
import assert from "node:assert/strict";
import { MOVIE_PRESENTATIONS } from "../cinema/moviePresentations.js";
import { buildCommentaryPrompt } from "../commentary/commentaryPrompt.js";
import { COMMENTARY_VERSION, parseCommentaryDocument } from "../commentary/commentaryFormat.js";
import { getTtsProvider, ttsProviderList } from "../commentary/tts/providers.js";
import { applyViewQuickPreset, VIEW_QUICK_PRESETS } from "../ui/viewQuickPresets.js";

assert.deepEqual(Object.keys(VIEW_QUICK_PRESETS), ["crisp2d", "framed2d", "topdown3d", "cinema3d"]);
const prefs = {};
applyViewQuickPreset(prefs, "topdown3d");
assert.equal(prefs.renderer, "procedural3d");
assert.equal(prefs.camera, "topDown3d");
assert.equal(prefs.environment, "clarity");
assert.equal(prefs.fog, false);
assert.deepEqual(Object.keys(MOVIE_PRESENTATIONS), ["instant2d", "animated2d", "topdown3d", "cinematic3d"]);

const frames = [{ ply: 0 }, { ply: 1, san: "e4" }, { ply: 2, san: "e5" }];
const document = parseCommentaryDocument(JSON.stringify({ version: COMMENTARY_VERSION, moves: [
	{ ply: 1, san: "e4", commentary: "White takes the center." },
	{ ply: 2, san: "e5", commentary: "Black answers symmetrically." }
] }), frames);
assert.equal(document.moves.length, 2);
const prompt = buildCommentaryPrompt("1. e4 e5");
assert.match(prompt, /awtsmoos-chess-commentary-v1/);
assert.match(prompt, /1\. e4 e5/);
assert.equal(getTtsProvider("deepgram").name, "Deepgram Aura");
assert.ok(ttsProviderList().some(provider => provider.id === "generic"));
console.log("CLARITY_COMMENTARY_PASS");
