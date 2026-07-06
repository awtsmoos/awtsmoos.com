// B"H
/** @file KlipahCreatureCatalog.js @description Symbolic opposition for refinement, not random fantasy monsters. */
export const KLIPAH_CREATURES = Object.freeze({ darkMist:{ form:"mist", weakness:"light", effect:"obscures-region" }, shadowBeast:{ form:"beast", weakness:"courage", effect:"scares-herds" }, brokenGolem:{ form:"stone", weakness:"repair", effect:"blocks-road" }, corruptedSpirit:{ form:"spirit", weakness:"song", effect:"silences-music" }, chaosCreature:{ form:"chaos", weakness:"order", effect:"scrambles-paths" } });
export function klipahProfile(type) { return { type, ...(KLIPAH_CREATURES[type] || KLIPAH_CREATURES.darkMist), purpose:"refinement", defeatVerb:"purify" }; }
export default KLIPAH_CREATURES;
