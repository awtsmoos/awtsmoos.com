// B"H
import assert from "node:assert/strict";
import { defaultAiWorldShortInput } from "../../ckidsAwtsmoos/studio/schema/AiWorldShortSchema.js";
import { parseAiWorldShort } from "../../ckidsAwtsmoos/studio/schema/AiWorldShortParser.js";
import { compileLivingCreationDocument, livingCreationSummary } from "../../ckidsAwtsmoos/studio/platform/LivingCreationPlatform.js";
import { generateActionLibrary, actionVocabulary } from "../../ckidsAwtsmoos/studio/platform/ProceduralActionGenerator.js";
import { runStudioProof } from "../../ckidsAwtsmoos/studio/proof/StudioProofHarness.js";
import { runMovieProof } from "../../ckidsAwtsmoos/studio/proof/MovieProofHarness.js";

const input = {
  ...defaultAiWorldShortInput(),
  prompt:"Make this scene more emotional.",
  directorPrompt:"Make this scene more emotional.",
  playerActions:[{ type:"buy", item:"travel_bread", count:1 }, { type:"sell", item:"fox_goods", count:2 }],
  actions:["idle", "walk", "run", "sprint", "limp", "talkHands", "pray", "openDoor", "castStorm", "heal", "block", "dodge"]
};

const parsed = parseAiWorldShort(input);
assert.equal(parsed.sourceSchema, "mitzvah-ai-world-short-v2");
assert.ok(parsed.graph.nodes.length >= 20, "AI JSON expands to graph nodes");
assert.ok(parsed.features.marketplace, "feature tokens create marketplace support");
assert.ok(parsed.terrain.river, "feature tokens create river terrain");

const compiled = compileLivingCreationDocument(input);
const summary = livingCreationSummary(compiled);
assert.equal(compiled.ok, true, "platform compile succeeds");
assert.ok(summary.graph.nodes >= parsed.graph.nodes.length, "graph is retained through platform compile");
assert.ok(compiled.ecosystem.herds.some(herd => herd.activity === "hunt" || herd.activity === "feed" || herd.activity === "graze"), "ecosystem produces animal activities");
assert.ok(compiled.economy.shops.some(shop => shop.stock.some(item => item.price > 0)), "shops receive living prices");
assert.ok(compiled.story.arcs.every(arc => arc.stages.some(stage => stage.kind === "branch")), "story arcs include branching consequences");
assert.ok(compiled.director.shots.some(shot => shot.shot === "closeup"), "director reacts to emotional prompt");
assert.ok(compiled.actionLibrary.actions.every(action => action.parametric && action.blendable), "actions are parametric and blendable");

const fullLibrary = generateActionLibrary(actionVocabulary());
assert.ok(fullLibrary.actions.length >= 30, "full action vocabulary covers requested gameplay/cinematic actions");
assert.ok(fullLibrary.actions.some(action => action.name === "pray"), "ritual action exists");
assert.ok(fullLibrary.actions.some(action => action.name === "castStorm"), "combat spell action exists");

const studio = runStudioProof();
assert.equal(studio.graphCreated, true, "World Studio proof creates graph");
assert.equal(studio.aiJsonCompiled, true, "World Studio proof compiles compact AI JSON");
assert.equal(studio.livingEconomyPriced, true, "World Studio proof prices economy");
assert.equal(studio.actionLibraryGenerated, true, "World Studio proof creates action library");

const movie = runMovieProof();
assert.equal(movie.nlePanelsAvailable, true, "Movie Maker exposes NLE panels");
assert.equal(movie.directorAiPlanned, true, "Movie Maker exercises Director AI");

console.log(JSON.stringify({ ok:true, summary, studio, movie }, null, 2));
