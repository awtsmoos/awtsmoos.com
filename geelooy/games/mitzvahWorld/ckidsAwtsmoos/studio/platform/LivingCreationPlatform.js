// B"H
import { parseAiWorldShort } from "../schema/AiWorldShortParser.js";
import { buildGraphFromAiWorld, summarizeGraph } from "./CreationGraph.js";
import { simulateEcosystem } from "./ProceduralEcosystem.js";
import { runLivingEconomy } from "./LivingEconomy.js";
import { generateStoryArcs } from "./StoryArcGenerator.js";
import { directWorldGraph } from "./DirectorAiEngine.js";
import { actionVocabulary, generateActionLibrary } from "./ProceduralActionGenerator.js";
import { ANIMAL_RULES, CHOSSID_GLB_INSPECTION, CORE_STATS, WEAPON_ARCHETYPES } from "../../platform/MitzvahPlatformCatalog.js";

export const LIVING_CREATION_PLATFORM_SCHEMA = "mitzvah-living-creation-platform-v1";

export function compileLivingCreationDocument(input = {}, options = {}) {
  const parsed = input?.schema === "mitzvah-studio-world-v1" ? input : parseAiWorldShort(input);
  const graph = parsed.graph || buildGraphFromAiWorld(parsed);
  const ecosystem = simulateEcosystem(parsed.animals, input.ecosystem || options.ecosystem || {});
  const economy = runLivingEconomy({ ...parsed, population:input.population || input.pop || 60 }, input.playerActions || []);
  const story = generateStoryArcs(parsed, { chains:input.questChains || input.chains || parsed.quests?.length || 3, theme:input.theme });
  const director = directWorldGraph(graph, { prompt:input.directorPrompt || input.prompt || "", mood:input.mood });
  const actionLibrary = generateActionLibrary([...(input.actions || []), ...actionVocabulary()]);
  return {
    schema:LIVING_CREATION_PLATFORM_SCHEMA,
    ok:true,
    parsed,
    graph,
    graphSummary:summarizeGraph(graph),
    ecosystem,
    economy,
    story,
    director,
    actionLibrary,
    platformCatalog:{
      stats:Object.keys(CORE_STATS),
      weapons:Object.keys(WEAPON_ARCHETYPES),
      animalRules:Object.keys(ANIMAL_RULES),
      chossidGlb:CHOSSID_GLB_INSPECTION
    },
    proof:{
      aiJsonExpanded:Boolean(parsed.world && graph.nodes.length),
      graphBased:graph.edges.length > 0,
      ecosystemSimulated:ecosystem.herds.length > 0,
      economyPriced:economy.shops.some(shop => shop.stock?.length),
      storyBranched:story.arcs.some(arc => arc.stages.some(stage => stage.kind === "branch")),
      directorPlanned:director.shots.length > 0,
      actionsGenerated:actionLibrary.actions.length >= 30,
      animalRulesShared:Object.keys(ANIMAL_RULES).length >= 10,
      chossidGlbInspected:CHOSSID_GLB_INSPECTION.morphTargets.mouth.includes("O")
    }
  };
}

export function livingCreationSummary(compiled = {}) {
  return {
    ok:Boolean(compiled.ok),
    graph:compiled.graphSummary,
    animals:compiled.ecosystem?.herds?.length || 0,
    shops:compiled.economy?.shops?.length || 0,
    questArcs:compiled.story?.arcs?.length || 0,
    shots:compiled.director?.shots?.length || 0,
    actions:compiled.actionLibrary?.actions?.length || 0,
    catalog:compiled.platformCatalog ? { stats:compiled.platformCatalog.stats.length, weapons:compiled.platformCatalog.weapons.length, animalRules:compiled.platformCatalog.animalRules.length } : null,
    proof:compiled.proof || {}
  };
}

export default { LIVING_CREATION_PLATFORM_SCHEMA, compileLivingCreationDocument, livingCreationSummary };
