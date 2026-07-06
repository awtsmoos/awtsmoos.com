// B"H
import { AI_WORLD_SHORT_SCHEMA_VERSION, SHORTHAND_TERMS } from "./AiWorldShortSchema.js";
import { createChossidCharacterWardrobe } from "../../characters/chossid/wardrobe/ChossidWardrobe.js";
import { buildGraphFromAiWorld, summarizeGraph } from "../platform/CreationGraph.js";

function arr(value) { return Array.isArray(value) ? value : value == null ? [] : [value]; }
function id(prefix, index) { return `${prefix}_${String(index + 1).padStart(2, "0")}`; }
function termsFor(kind, key) { return SHORTHAND_TERMS[kind]?.[key] || {}; }

function parseReward(text = "") {
  const reward = { coins:0, xp:0, items:[] };
  for (const raw of String(text).split(",")) {
    const [kind, value] = raw.split(":").map(part => part?.trim()).filter(Boolean);
    if (kind === "coin" || kind === "coins") reward.coins += Number(value || 0);
    else if (kind === "xp") reward.xp += Number(value || 0);
    else if (kind === "item" && value) reward.items.push(value);
  }
  return reward;
}

function parseObjective(text = "") {
  const parts = String(text).trim().split(/\s+/);
  if (parts[0] === "kill") return { type:"kill", target:parts[1], count:Number(parts[2] || 1), label:text };
  if (parts[0] === "collect") return { type:"collect", target:parts[1], count:Number(parts[2] || 1), label:text };
  return { type:"custom", label:text || "Do the mitzvah task", count:1 };
}

function compactTokens(input = {}) {
  return arr(input.generate || input.features || input.includes).flatMap(value => String(value).split(/[,|]/)).map(value => value.trim()).filter(Boolean);
}

function expandWorldFeatures(input = {}) {
  const tokens = new Set(compactTokens(input).map(token => token.toLowerCase()));
  return {
    village:tokens.has("village") || Boolean(input.population || input.pop),
    population:Number(input.population || input.pop || 0),
    marketplace:tokens.has("marketplace") || tokens.has("market"),
    synagogue:tokens.has("synagogue") || tokens.has("shul"),
    river:tokens.has("river"),
    bridge:tokens.has("bridge"),
    forest:tokens.has("forest"),
    caves:tokens.has("cave") || tokens.has("caves"),
    dungeons:tokens.has("dungeon") || tokens.has("dungeons"),
    weather:input.weather || (tokens.has("rain") ? "rain" : tokens.has("golden sunset") ? "golden_sunset" : null)
  };
}

function expandHouse(tokens, index) {
  const flags = Object.assign({}, ...arr(tokens).map(token => termsFor("house", token)));
  return {
    id:id("house", index),
    type:"house",
    material:flags.material || "wood",
    style:flags.style || "village",
    door:flags.door ? { id:id("door", index), interactable:true, opensTo:`interior_${index + 1}` } : null,
    service:flags.service || null,
    position:[index * 5 - 2.5, 0, index % 2 ? -4 : 4]
  };
}

function expandAnimals(input = [], seed = 1) {
  const placed = [];
  arr(input).forEach((animal, groupIndex) => {
    const species = animal.sp || animal.species || "fox";
    const count = Math.max(1, Number(animal.n || animal.count || 1));
    for (let i = 0; i < count; i++) {
      placed.push({
        id:`${species}_${groupIndex + 1}_${i + 1}`,
        species,
        probability:Number(animal.p ?? animal.probability ?? 1),
        hostile:Boolean(animal.hostile),
        friendly:animal.friendly !== undefined ? Boolean(animal.friendly) : !animal.hostile,
        questRole:animal.quest || null,
        loot:String(animal.loot || "").split(",").map(x => x.trim()).filter(Boolean),
        lod:["near-hyper-anatomy", "mid-recognizable", "far-silhouette"],
        genome:{ seed:seed + groupIndex * 97 + i, age:animal.age || "adult" },
        position:[groupIndex * 3 + i * 1.2, 0, 6 + groupIndex]
      });
    }
  });
  return placed;
}

function expandNpc(npc, index) {
  const role = npc.role || "villager";
  const character = npc.character || "chossid";
  const clothes = npc.clothes || {};
  return {
    id:npc.id || id("npc", index),
    type:"npc",
    role,
    behavior:{ ...termsFor("roles", role) },
    quests:arr(npc.q || npc.quest),
    shop:npc.shop || null,
    trainer:npc.teach ? { teach:arr(npc.teach) } : null,
    character,
    clothes,
    wardrobe:character === "chossid" ? createChossidCharacterWardrobe({ clothes }) : null,
    actions:arr(npc.actions || ["idle", "talkHands"]),
    position:[index * 2.5, 0, -2.5]
  };
}

function expandQuest(quest, index) {
  return {
    id:quest.id || id("quest", index),
    chain:Number(quest.chain || index + 1),
    giverId:quest.giverId || null,
    objective:parseObjective(quest.obj || quest.objective),
    rewards:{ ...parseReward(quest.reward), xp:Number(quest.xp || 0) },
    next:quest.next || null
  };
}

function expandMovie(movie = {}) {
  let cursor = 0;
  const shots = arr(movie.shots).map((shot, index) => {
    const tokens = arr(shot);
    const shotKey = tokens[0] || "wide";
    const maybeDuration = Number(tokens.at(-1));
    const duration = Number.isFinite(maybeDuration) && maybeDuration > 0 ? maybeDuration : 3;
    const camera = termsFor("shots", shotKey);
    const action = tokens.find(token => SHORTHAND_TERMS.actions[token]);
    const expanded = {
      id:id("shot", index),
      shot:shotKey,
      ...camera,
      subject:tokens[1] || "village",
      action:action ? SHORTHAND_TERMS.actions[action] : null,
      start:cursor,
      duration,
      cameraKeyframes:[
        { time:cursor, position:[0 + index, 3.2, 7 - index * .4], lookAt:[0, 1.1, 0] },
        { time:cursor + duration, position:[1.5 + index, 2.4, 5 - index * .25], lookAt:[.4, 1.2, 0] }
      ],
      subtitle:tokens[0] === "dialog" ? `${tokens[1] || "npc"} speaks` : null
    };
    cursor += duration;
    return expanded;
  });
  return {
    id:movie.id || "ai_generated_movie",
    duration:Math.max(cursor, Number(movie.duration || 0), 1),
    shots,
    tracks:["camera", "actor", "dialogue", "subtitle", "audio"],
    proceduralDirector:{ cameraCuts:true, actionContinuity:true, animalCoverage:true }
  };
}

export function parseAiWorldShort(input = {}) {
  const seed = Number(input.seed || 1);
  const features = expandWorldFeatures(input);
  const houses = arr(input.houses).map(expandHouse);
  const animals = expandAnimals(input.animals, seed);
  const npcs = arr(input.npcs).map(expandNpc);
  const quests = arr(input.quests).map(expandQuest);
  const movie = expandMovie(input.movie || {});
  const worldId = input.world || "village";
  if (features.marketplace && !houses.some(h => h.service === "shop")) houses.push(expandHouse(["wood", "door", "shop"], houses.length));
  if (features.synagogue) houses.push({ ...expandHouse(["stone", "door"], houses.length), id:"synagogue", type:"synagogue", service:"prayer_learning" });
  const npcShops = npcs.filter(npc => npc.shop).map(npc => ({ id:npc.shop, npcId:npc.id, stock:"starter" }));
  const buildingShops = houses.filter(house => house.service === "shop").map(house => ({ id:`shop_${house.id}`, buildingId:house.id, stock:"starter" }));
  const npcTrainers = npcs.filter(npc => npc.trainer).map(npc => ({ id:`trainer_${npc.id}`, npcId:npc.id, teach:npc.trainer.teach }));
  const buildingTrainers = houses.filter(house => house.service === "trainer").map(house => ({ id:`trainer_${house.id}`, buildingId:house.id, teach:["walk", "block", "dodge"] }));
  const parsed = {
    schema:"mitzvah-studio-world-v1",
    sourceSchema:AI_WORLD_SHORT_SCHEMA_VERSION,
    world:{ id:termsFor("world", worldId) || worldId, shorthand:worldId, seed, population:features.population || undefined },
    features,
    terrain:{ grass:termsFor("grass", input.grass || "lush"), path:{ material:"packed-dirt", visible:true }, river:features.river, bridge:features.bridge, forest:features.forest, weather:features.weather },
    houses,
    doors:houses.map(house => house.door).filter(Boolean),
    animals,
    npcs,
    quests,
    shops:[...npcShops, ...buildingShops],
    trainers:[...npcTrainers, ...buildingTrainers],
    movie,
    savedWorld:{ ok:true, id:`${worldId}_${seed}`, generatedAt:new Date().toISOString() }
  };
  parsed.graph = buildGraphFromAiWorld(parsed);
  parsed.graphSummary = summarizeGraph(parsed.graph);
  return parsed;
}

export function summarizeParsedAiWorld(parsed) {
  return {
    parsedExample:Boolean(parsed?.sourceSchema),
    placedAnimals:parsed?.animals?.length || 0,
    createdQuest:parsed?.quests?.length || 0,
    createdNpcs:parsed?.npcs?.length || 0,
    createdMovieShots:parsed?.movie?.shots?.length || 0,
    savedWorld:Boolean(parsed?.savedWorld?.ok)
  };
}

export default { parseAiWorldShort, summarizeParsedAiWorld };
