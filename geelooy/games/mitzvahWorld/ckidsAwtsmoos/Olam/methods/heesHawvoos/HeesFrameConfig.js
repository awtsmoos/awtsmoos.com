// B"H
/** HeesFrameConfig.js — frame-loop constants split from the moving engine. */
export const FOCUS_EPS = .0001;
export const WARN_LIMIT = 10;
export const READY_SIGNAL_MS = 900;
export const NIVRA_CACHE_MS = 900;
export const NON_PLAYER_ENTITY_BUDGET = 6;
export const SIMPLE_NPC_NEAR_SQ = 22 * 22;
export const VANITY = new Set(['LineSegments','Line','Points','AxesHelper','GridHelper','BoxHelper']);
export const DYNAMIC = new Set(['interactiveNpc','customNpc','medabeir','mazik','enemy','animal','wildlife','chossid','livingregionticker','discoveryticker']);
export const STATIC = new Set(['proceduralsky','proceduralterrain','villagepictureprop','villagetreefield','villageherotree','villagegrassfield','villagestonepath','villagebackdrop','villageskylayers','villagefencecollider','villagehousecollider','villagelightingrig','villagecamerapreset']);
