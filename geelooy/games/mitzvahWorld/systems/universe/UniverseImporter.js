// B"H
/** Imports pure JSON into a movie-ready living-universe plan. */
import { normalizeUniverseJson, summarizeUniverseJson } from "./schema/UniverseJsonSchema.js";
import { createLivingBeings } from "./LivingBeingFactory.js";
import { buildInteractionGraph } from "./InteractionGraph.js";
import { buildAllCutscenes } from "../cinema/CutsceneDirector.js";
import { buildEpisodeArcs } from "./EpisodeEngine.js";
import { SubscriptionArcRuntime } from "./SubscriptionArcRuntime.js";
export function importUniverse(input = {}) {
  const universe = normalizeUniverseJson(input), beings = createLivingBeings(universe), graph = buildInteractionGraph(universe, beings), cutscenes = buildAllCutscenes(universe), episodes = buildEpisodeArcs(universe), subscription = new SubscriptionArcRuntime(episodes);
  return { universe, summary:summarizeUniverseJson(universe), beings, graph, cutscenes, episodes, subscription:subscription.snapshot() };
}
export default importUniverse;
