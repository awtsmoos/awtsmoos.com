// B"H
const list = value => Array.isArray(value) ? value : value == null ? [] : [value];

function objectiveFor(theme, index) {
  if (/merchant|market|shop/.test(theme)) return { type:"delivery", target:"market_goods", count:1 };
  if (/forest|animal|fox/.test(theme)) return { type:"investigation", target:"forest_tracks", count:3 };
  return { type:index % 2 ? "collection" : "talk", target:index % 2 ? "supplies" : "elder", count:index % 2 ? 3 : 1 };
}

export function generateStoryArcs(world = {}, options = {}) {
  const requested = Math.max(1, Number(options.chains || world.questChains || 3));
  const npcs = list(world.npcs);
  const quests = list(world.quests);
  const arcs = [];
  for (let i = 0; i < requested; i++) {
    const giver = npcs[i % Math.max(1, npcs.length)]?.id || `story_giver_${i + 1}`;
    const seedQuest = quests[i] || {};
    const theme = seedQuest.id || seedQuest.objective?.target || options.theme || "village";
    const id = seedQuest.id || `arc_${i + 1}_opening`;
    arcs.push({
      id:`quest_arc_${i + 1}`,
      title:seedQuest.title || `Quest Arc ${i + 1}`,
      giver,
      stages:[
        { id, kind:"setup", objective:seedQuest.objective || objectiveFor(theme, i), consequence:{ flag:`${id}_started`, worldState:"npc_memory" } },
        { id:`${id}_branch_help`, kind:"branch", choice:"help", consequence:{ reputation:+5, unlock:`${id}_resolution_good` } },
        { id:`${id}_branch_refuse`, kind:"branch", choice:"refuse", consequence:{ reputation:-2, unlock:`${id}_resolution_delayed` } },
        { id:`${id}_cutscene`, kind:"cutscene_trigger", cutsceneId:`cutscene_${id}`, consequence:{ movieTrigger:`movie_${id}` } }
      ],
      consequences:["npc_memory", "world_state_change", "cutscene_trigger", "reward_table"]
    });
  }
  return { arcs, graphEdges:arcs.flatMap(arc => arc.stages.map(stage => ({ from:arc.id, to:stage.id, relation:"has_stage" }))) };
}

export default { generateStoryArcs };
