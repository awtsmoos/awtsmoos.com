// B"H
/** @file SocialAggroRuntime.js @description Nearby allies answer the cry without making solo content impossible. */
import { forceAggro } from "./AggroRuntime.js";
function pos(c) { return c?.mesh?.position || c?.position || {}; }
function dist(a, b) { return Math.hypot((pos(a).x || 0) - (pos(b).x || 0), (pos(a).z || 0) - (pos(b).z || 0)); }
export function socialAllies(creature, creatures = [], radius = 18) { const species = creature?.def?.species || creature?.mesh?.userData?.species || creature?.species; return creatures.filter(c => c !== creature && dist(c, creature) <= radius && ((c?.def?.species || c?.mesh?.userData?.species || c?.species) === species || c?.mesh?.userData?.socialAggro)); }
export function callForHelp(creature, creatures = [], sourceId = "player") { const allies = socialAllies(creature, creatures); for (const ally of allies) forceAggro(ally, sourceId, "social-help", 3); return allies; }
export default { socialAllies, callForHelp };
