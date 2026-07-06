// B"H
const diet = species => /fox|boar|dog|wolf|hawk/.test(String(species)) ? "predator" : /goat|cow|deer|rabbit|sheep|horse|chicken/.test(String(species)) ? "prey" : "ambient";
const clamp = (n, min, max) => Math.max(min, Math.min(max, Number(n) || 0));

export function createResourceCycle(options = {}) {
  const season = options.season || "spring";
  const rain = clamp(options.rain ?? (season === "winter" ? .7 : season === "summer" ? .25 : .55), 0, 1);
  const vegetation = clamp(options.vegetation ?? (.35 + rain * .55), 0, 1);
  const water = clamp(options.water ?? (.3 + rain * .6), 0, 1);
  return { season, rain, vegetation, water, daylight:season === "winter" ? .45 : season === "summer" ? .75 : .6 };
}

export function simulateEcosystem(animals = [], options = {}) {
  const resources = createResourceCycle(options);
  const herds = {};
  for (const animal of animals) {
    const role = diet(animal.species);
    herds[animal.species] ||= { species:animal.species, role, count:0, hunger:0, fear:0, births:0, deaths:0, migration:null, activity:"wander" };
    herds[animal.species].count += 1;
  }
  const predatorCount = Object.values(herds).filter(h => h.role === "predator").reduce((sum, h) => sum + h.count, 0);
  const preyPressure = Object.values(herds).filter(h => h.role === "prey").reduce((sum, h) => sum + h.count, 0);
  for (const herd of Object.values(herds)) {
    herd.hunger = clamp(herd.role === "predator" ? .35 + preyPressure < predatorCount * 3 ? .4 : .1 : .75 - resources.vegetation, 0, 1);
    herd.fear = clamp(herd.role === "prey" ? predatorCount / Math.max(1, preyPressure) : .1, 0, 1);
    herd.births = resources.vegetation > .62 && herd.role !== "predator" ? Math.max(1, Math.floor(herd.count * .08)) : 0;
    herd.deaths = herd.hunger > .72 ? Math.max(1, Math.floor(herd.count * .05)) : 0;
    herd.migration = resources.water < .35 ? "toward_river" : herd.fear > .35 ? "toward_cover" : null;
    herd.activity = resources.daylight < .5 ? "sleep" : herd.hunger > .55 ? "feed" : herd.role === "predator" ? "hunt" : "graze";
  }
  return {
    resources,
    herds:Object.values(herds),
    relationships:{ predators:predatorCount, prey:preyPressure, vegetationPressure:clamp(preyPressure / 80, 0, 1) },
    events:Object.values(herds).flatMap(herd => [herd.births ? { type:"breeding", species:herd.species, count:herd.births } : null, herd.migration ? { type:"migration", species:herd.species, to:herd.migration } : null].filter(Boolean))
  };
}

export default { createResourceCycle, simulateEcosystem };
