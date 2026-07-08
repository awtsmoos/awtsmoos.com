// B"H
/** Imports pure JSON into a movie-ready living-universe plan. */
import { normalizeUniverseJson, summarizeUniverseJson } from "./schema/UniverseJsonSchema.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { createLivingBeings } from "./LivingBeingFactory.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { buildInteractionGraph } from "./InteractionGraph.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { buildAllCutscenes } from "../cinema/CutsceneDirector.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { buildEpisodeArcs } from "./EpisodeEngine.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { SubscriptionArcRuntime } from "./SubscriptionArcRuntime.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
export function importUniverse(input = {}) {
  const universe = normalizeUniverseJson(input), beings = createLivingBeings(universe), graph = buildInteractionGraph(universe, beings), cutscenes = buildAllCutscenes(universe), episodes = buildEpisodeArcs(universe), subscription = new SubscriptionArcRuntime(episodes);
  return { universe, summary:summarizeUniverseJson(universe), beings, graph, cutscenes, episodes, subscription:subscription.snapshot() };
}
export default importUniverse;
