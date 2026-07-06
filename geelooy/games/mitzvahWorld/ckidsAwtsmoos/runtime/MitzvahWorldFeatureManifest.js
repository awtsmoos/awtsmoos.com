// B"H
/** @file MitzvahWorldFeatureManifest.js @description Aggressive feature manifest joining Studio, Movie, AI, animals, Klipah, and gameplay. */
import { getMitzvahRuntimeFacade } from "../Olam/runtime/facade/MitzvahRuntimeFacade.js";
import { installWorldStudioFeaturePack } from "../studio/runtime/WorldStudioFeaturePack.js";
import { installMovieMakerFeaturePack } from "../movie/runtime/MovieMakerFeaturePack.js";
import { installWorldGenerationFeaturePack } from "../ai/runtime/WorldGenerationFeaturePack.js";
import { installMitzvahActions } from "../actions/runtime/MitzvahActionCatalog.js";
import { listKosherSpecies } from "../animals/runtime/KosherAnimalSpecies.js";
export function installMitzvahWorldFeatureManifest(seed = {}) {
  const runtime = getMitzvahRuntimeFacade(seed);
  const studio = installWorldStudioFeaturePack(runtime);
  const movie = installMovieMakerFeaturePack(runtime, seed.timeline || { tracks:[] });
  const world = installWorldGenerationFeaturePack(runtime, seed.worldIntent || {});
  const actions = installMitzvahActions(runtime);
  runtime.markReady("animals:species", { species:listKosherSpecies() });
  runtime.markReady("features:manifest", { studioTools:studio.list().length, movieCommands:movie.compiled.commands.length, entities:world.entities.length, actions:actions.length });
  return { runtime, studio, movie, world, actions, species:listKosherSpecies() };
}
export default installMitzvahWorldFeatureManifest;
