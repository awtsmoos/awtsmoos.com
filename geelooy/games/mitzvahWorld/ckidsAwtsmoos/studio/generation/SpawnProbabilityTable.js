// B"H
const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value) || 0));

export function createSpawnRule(input = {}) {
  const species = input.species || "fox";
  return {
    species,
    weight:clamp(input.weight ?? 0.12, 0, 1),
    maxCount:Math.max(0, Math.floor(Number(input.maxCount ?? 8))),
    biomes:Array.isArray(input.biomes) && input.biomes.length ? input.biomes : ["villageEdge", "forest"],
    spawnTime:input.spawnTime || "any",
    hostility:input.hostility || (species === "fox" || species === "boar" ? "hostile" : "passive"),
    groupSize:Array.isArray(input.groupSize) ? input.groupSize : [1, 2],
    rarity:input.rarity || "common",
    lootTable:input.lootTable || `${species}Loot`,
    questRelevance:input.questRelevance || [],
    respawnSeconds:Math.max(0, Math.floor(Number(input.respawnSeconds ?? 120)))
  };
}

export function normalizeSpawnRules(rules = []) {
  return rules.map(createSpawnRule);
}

export function saveSpawnRulesToWorld(project, rules) {
  project.animalSpawnRules = normalizeSpawnRules(rules);
  project.updatedAt = new Date().toISOString();
  return project.animalSpawnRules;
}

export function weightedSpawnPreview(rules = [], seed = 1, count = 24) {
  const normalized = normalizeSpawnRules(rules).filter(rule => rule.weight > 0 && rule.maxCount > 0);
  const totals = Object.fromEntries(normalized.map(rule => [rule.species, 0]));
  const totalWeight = normalized.reduce((sum, rule) => sum + rule.weight, 0) || 1;
  let state = Math.max(1, Math.floor(seed));
  const rand = () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
  const out = [];
  for (let i = 0; i < count; i++) {
    let roll = rand() * totalWeight;
    for (const rule of normalized) {
      roll -= rule.weight;
      if (roll <= 0 && totals[rule.species] < rule.maxCount) {
        totals[rule.species]++;
        out.push({ species:rule.species, biome:rule.biomes[i % rule.biomes.length], hostility:rule.hostility });
        break;
      }
    }
  }
  return { ok:true, totals, spawns:out };
}

export function runtimeSpawnsRespectWeights(rules = []) {
  const preview = weightedSpawnPreview(rules, 613, 120);
  return Object.entries(preview.totals).every(([species, count]) => {
    const rule = normalizeSpawnRules(rules).find(item => item.species === species);
    return count <= (rule?.maxCount || 0);
  });
}

export default { createSpawnRule, normalizeSpawnRules, saveSpawnRulesToWorld, weightedSpawnPreview, runtimeSpawnsRespectWeights };
