// B"H
const ARCHETYPES = Object.freeze({
  fox:{ body:"long", muzzle:"pointed", ears:"triangular", tail:"bushy", legs:"quick", coat:["red", "cream belly", "black socks"], hostility:.75, size:1 },
  goat:{ body:"compact", muzzle:"blunt", ears:"side", horns:"swept", beard:true, hooves:true, coat:["cream", "brown patches"], hostility:.2, size:1.05 },
  cow:{ body:"heavy", muzzle:"wide", ears:"rounded", horns:"short", udder:true, hooves:true, coat:["black", "white patches"], hostility:.05, size:1.8 },
  deer:{ body:"slender", muzzle:"tapered", ears:"large", antlers:true, tail:"short", coat:["tan", "white spots"], hostility:.1, size:1.25 },
  rabbit:{ body:"round", muzzle:"small", ears:"long", tail:"cotton", paws:true, coat:["sand", "cream belly"], hostility:.02, size:.55 },
  frog:{ body:"low", eyes:"raised", mouth:"wide", legs:"spring", webbed:true, skin:["green", "mottled"], hostility:.02, size:.42 },
  bird:{ body:"oval", beak:"short", wings:true, tail:"fan", legs:"thin", feathers:["blue", "cream breast"], hostility:.08, size:.5 },
  chicken:{ body:"round", beak:"short", comb:true, wings:true, tail:"upright", legs:"thin", feathers:["white", "red comb"], hostility:.05, size:.62 },
  boar:{ body:"barrel", muzzle:"tusked", ears:"small", tusks:true, bristles:true, hooves:true, coat:["dark brown", "mud"], hostility:.82, size:1.1 },
  sheep:{ body:"woolly", muzzle:"soft", ears:"side", wool:true, hooves:true, coat:["white wool", "dark face"], hostility:.03, size:.95 },
  dog:{ body:"athletic", muzzle:"canine", ears:"floppy", tail:"curved", paws:true, coat:["brown", "white chest"], hostility:.25, size:.85 },
  horse:{ body:"tall", muzzle:"long", ears:"alert", mane:true, hooves:true, tail:"long hair", coat:["bay", "black mane"], hostility:.08, size:1.7 }
});

function hash(text) {
  let h = 2166136261;
  for (const char of String(text)) h = Math.imul(h ^ char.charCodeAt(0), 16777619);
  return h >>> 0;
}

function rand(seed) {
  let state = hash(seed);
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export function speciesArchetypes() {
  return ARCHETYPES;
}

export function createAnimalGenome(species = "fox", options = {}) {
  const archetype = ARCHETYPES[species] || ARCHETYPES.fox;
  const random = rand(`${species}:${options.seed || 1}`);
  const ageScale = options.age === "baby" ? .58 : 1;
  const variation = {
    size:(.88 + random() * .24) * archetype.size * ageScale,
    legLength:.9 + random() * .22,
    bodyLength:.88 + random() * .25,
    earScale:.85 + random() * .35,
    tailScale:.75 + random() * .45,
    markingDensity:.25 + random() * .7
  };
  return {
    species,
    seed:options.seed || 1,
    archetype,
    age:options.age || "adult",
    variation,
    bodyLanguage:options.bodyLanguage || (archetype.hostility > .6 ? "aggressive" : "friendly"),
    hostility:options.hostility ?? archetype.hostility,
    friendliness:options.friendliness ?? (1 - archetype.hostility),
    lod:{ near:"anatomical", mid:"simplified", far:"impostor" }
  };
}

export function genomeRealismScore(genome) {
  const a = genome?.archetype || {};
  const traits = ["body", "muzzle", "ears", "legs", "coat", "tail", "horns", "antlers", "beak", "wings", "hooves", "paws", "tusks", "wool", "mane"];
  return traits.reduce((sum, key) => sum + (a[key] ? 1 : 0), 0);
}

export default { speciesArchetypes, createAnimalGenome, genomeRealismScore };
