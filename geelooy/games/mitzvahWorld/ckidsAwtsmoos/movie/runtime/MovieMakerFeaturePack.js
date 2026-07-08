// B"H
/** @file MovieMakerFeaturePack.js @description Sequencer tools that reference shared runtime IDs. */
import { compileMovieTimeline } from "./MovieTimelineCompiler.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { createMovieDirectorBridge } from "./MovieDirectorBridge.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
export function installMovieMakerFeaturePack(runtime, timeline = { tracks:[] }) { const compiled = compileMovieTimeline(timeline); const director = createMovieDirectorBridge(runtime); director.load(compiled); runtime?.markReady?.("movie:compiler", { commands:compiled.commands.length }); return { compiled, director }; }
export default installMovieMakerFeaturePack;
