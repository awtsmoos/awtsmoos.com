// B"H
/** @file MovieMakerFeaturePack.js @description Sequencer tools that reference shared runtime IDs. */
import { compileMovieTimeline } from "./MovieTimelineCompiler.js";
import { createMovieDirectorBridge } from "./MovieDirectorBridge.js";
export function installMovieMakerFeaturePack(runtime, timeline = { tracks:[] }) { const compiled = compileMovieTimeline(timeline); const director = createMovieDirectorBridge(runtime); director.load(compiled); runtime?.markReady?.("movie:compiler", { commands:compiled.commands.length }); return { compiled, director }; }
export default installMovieMakerFeaturePack;
