//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Guards readable quick views, complete movie presentations, portable commentary, and broad provider discovery.
 * The Awtsmoos lets one test witness many finite garments without mistaking them for the lawful game beneath;
 * Awtsmoos.com separates calm readable native views from chosen cinema while voice and commentary remain portable.
 */
import assert from "node:assert/strict";
import { MOVIE_PRESENTATIONS } from "../cinema/moviePresentations.js";
import { buildCommentaryPrompt } from "../commentary/commentaryPrompt.js";
import { COMMENTARY_VERSION, parseCommentaryDocument } from "../commentary/commentaryFormat.js";
import { getTtsProvider, ttsProviderList } from "../commentary/tts/providers.js";
import { applyViewQuickPreset, VIEW_QUICK_PRESETS } from "../ui/viewQuickPresets.js";

assert.deepEqual(Object.keys(VIEW_QUICK_PRESETS), [
	"instant2d",
	"animated2d",
	"crisp2d",
	"royal2d",
	"framed2d",
	"topdown3d",
	"readable3d",
	"broadcast3d",
	"cinema3d"
]);

const preferences = {};
applyViewQuickPreset(preferences, "instant2d");
assert.equal(preferences.previewMotion, "instant");
applyViewQuickPreset(preferences, "royal2d");
assert.equal(preferences.canvasPieceStyle, "soft");
applyViewQuickPreset(preferences, "topdown3d");
assert.equal(preferences.renderer, "procedural3d");
assert.equal(preferences.camera, "topDown3d");
assert.equal(preferences.cameraMotion, "static");
assert.equal(preferences.lighting, "readability");
assert.equal(preferences.environment, "readability");
assert.equal(preferences.pieceScale, 0.82);
assert.equal(preferences.fog, false);
applyViewQuickPreset(preferences, "readable3d");
assert.equal(preferences.camera, "birdseyeWhite");
assert.equal(preferences.cameraMotion, "static");
applyViewQuickPreset(preferences, "broadcast3d");
assert.equal(preferences.camera, "broadcastWhite");
assert.equal(preferences.cameraMotion, "static");
applyViewQuickPreset(preferences, "cinema3d");
assert.equal(preferences.camera, "auto");
assert.equal(preferences.cameraMotion, "director");
assert.equal(preferences.lighting, "studio");
assert.equal(preferences.environment, "clarity");

assert.deepEqual(Object.keys(MOVIE_PRESENTATIONS), [
	"instant2d",
	"animated2d",
	"cinematic2d",
	"topdown3d",
	"broadcast3d",
	"cinematic3d"
]);
assert.equal(MOVIE_PRESENTATIONS.cinematic2d.renderMode, "canvas2d");
assert.equal(MOVIE_PRESENTATIONS.cinematic2d.cameraMotion, "director");
assert.equal(MOVIE_PRESENTATIONS.broadcast3d.renderMode, "procedural3d");
assert.equal(MOVIE_PRESENTATIONS.broadcast3d.camera, "broadcastWhite");

const frames = [
	{ ply: 0 },
	{ ply: 1, san: "e4" },
	{ ply: 2, san: "e5" }
];
const document = parseCommentaryDocument(
	JSON.stringify({
		version: COMMENTARY_VERSION,
		moves: [
			{ ply: 1, san: "e4", commentary: "White takes the center." },
			{ ply: 2, san: "e5", commentary: "Black answers symmetrically." }
		]
	}),
	frames
);
assert.equal(document.moves.length, 2);

const prompt = buildCommentaryPrompt("1. e4 e5");
assert.match(prompt, /every main-line half-move/i);
assert.match(prompt, /awtsmoos-chess-commentary-v1/);
assert.match(prompt, /1\. e4 e5/);
assert.equal(getTtsProvider("deepgram").name, "Deepgram Aura · backend");
assert.ok(ttsProviderList().some(provider => provider.id === "playht"));
assert.ok(ttsProviderList().some(provider => provider.id === "generic"));
assert.equal(getTtsProvider("amazon").kind, "proxy");
console.log("CLARITY_COMMENTARY_PASS");
