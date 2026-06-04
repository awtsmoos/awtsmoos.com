/**
 * B"H
 * @module TorahCodexIndex
 * @description Discoverable route families, fusions, and soul-class affinities.
 *
 * Chapter 167: The Pokédex became a sefer. The Awtsmoos has no body and no
 * form, yet the player needs a collection fantasy: not monsters in balls, but
 * living pathways of Torah, each one leveling through use, merging with other
 * routes, and shaping the soul-build like a class in a vast world.
 */
export const TorahRouteFamilies = {
  avos: { name: 'Pirkei Avos', category: 'Mishnah', stat: 'chochmah', classPath: 'Chesed Guide', badge: 'אבות' },
  berakhot: { name: 'Berakhot', category: 'Mishnah', stat: 'binah', classPath: 'Blessing Keeper', badge: 'ברכות' },
  tanya: { name: 'Tanya', category: 'Chassidus', stat: 'daat', classPath: 'Inner Flame', badge: 'תניא' },
  hitbonenus: { name: 'Hitbonenus', category: 'Chassidus', stat: 'binah', classPath: 'Contemplator', badge: 'התבוננות' },
  sefirot: { name: 'Ten Sefiros', category: 'Kabbalah', stat: 'chochmah', classPath: 'Sefirah Weaver', badge: 'ספירות' },
  tzimtzum: { name: 'Tzimtzum', category: 'Kabbalah', stat: 'binah', classPath: 'Boundary Mystic', badge: 'צמצום' },
  ohrChozer: { name: 'Ohr Chozer', category: 'Kabbalah', stat: 'daat', classPath: 'Returner of Light', badge: 'או״ח' },
  simcha: { name: 'Simcha Niggun', category: 'Niggun', stat: 'binah', classPath: 'Joy Singer', badge: 'שמחה' },
  hisorerus: { name: 'Hisorerus Niggun', category: 'Niggun', stat: 'daat', classPath: 'Awakener', badge: 'התעוררות' }
};

export const TorahFusionRecipes = [
  { id: 'ahavas_yisrael', name: 'Ahavas Yisrael Tree', needs: ['avos', 'tanya'], bonus: { daat: 2, maxLight: 8 }, quote: 'Judge favorably until love becomes the proof.' },
  { id: 'joyful_trust', name: 'Joyful Trust', needs: ['simcha', 'hitbonenus'], bonus: { binah: 3, maxLight: 6 }, quote: 'Joy carries trust where calculation cannot walk.' },
  { id: 'returning_crown', name: 'Returning Crown', needs: ['ohrChozer', 'tzimtzum'], bonus: { chochmah: 2, daat: 2 }, quote: 'The finite vessel returns a light higher than descent.' },
  { id: 'blessed_world', name: 'Blessed World', needs: ['berakhot', 'sefirot'], bonus: { chochmah: 1, binah: 1, daat: 1, maxLight: 5 }, quote: 'Blessing maps the world back to its living Source.' }
];

export const ZoneThemes = {
  Overworld_Main: { act: 1, name: 'Village of Chesed', route: 'avos', mood: 'learning begins in kindness' },
  Forest_North: { act: 1, name: 'Forest of Helem', route: 'tzimtzum', mood: 'hiddenness becomes a question' },
  Market_West: { act: 2, name: 'Market of Words', route: 'berakhot', mood: 'speech must be weighed' },
  River_East: { act: 3, name: 'River of Crossing', route: 'ohrChozer', mood: 'movement returns from below' },
  Academy_Upper: { act: 3, name: 'Academy of Sources', route: 'avos', mood: 'proof becomes a path' },
  Chamber_Eit: { act: 3, name: 'Chamber of Eit', route: 'hitbonenus', mood: 'timing becomes wisdom' },
  Letter_Forge: { act: 4, name: 'Forge of Letters', route: 'sefirot', mood: 'letters hammer garments' },
  Niggun_Bridge: { act: 4, name: 'Niggun Bridge', route: 'simcha', mood: 'song crosses doubt' },
  Cave_Sod: { act: 4, name: 'Cave of Sod', route: 'ohrChozer', mood: 'below awakens crown' },
  Ruins_Lower: { act: 5, name: 'Ruins of Hidden Light', route: 'tanya', mood: 'brokenness becomes mission' }
};

export const routeFamilyById = id => TorahRouteFamilies[id] || null;
export const routeFamilyByTitle = title => Object.entries(TorahRouteFamilies).find(([, r]) => r.name === title)?.[0] || null;
export const zoneThemeForMap = mapId => ZoneThemes[mapId] || { act: 1, name: mapId, route: 'avos', mood: 'the road waits to be read' };
