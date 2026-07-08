// B"H
/** @file TerritorySystem.js @description Territory ownership and pressure. */
import { around, dataOf, dist, posOf } from './LifeMath.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
const RADIUS = Object.freeze({ fox:72, rabbit:24, deer:90, goat:52, frog:18, bird:110 });
export function ensureTerritory(actor) { const data = dataOf(actor), motion = data.motion || {}, species = data.species || motion.species || 'rabbit'; if (!data.territory) data.territory = { center:{ x:motion.homeX || posOf(actor).x, z:motion.homeZ || posOf(actor).z }, radius:RADIUS[species] || 32, species }; return data.territory; }
export function territoryPressure(actor) { const t = ensureTerritory(actor), d = dist(posOf(actor), t.center); return { outside:d > t.radius, distance:d, pressure:Math.max(0, d - t.radius) / Math.max(1, t.radius) }; }
export function territoryWaypoint(actor, seed = 1) { const t = ensureTerritory(actor); return around(t.center, t.radius * .85, seed); }
export function territorySummary(actors = []) { const bySpecies = {}; actors.forEach(a => { const t = ensureTerritory(a); bySpecies[t.species] = (bySpecies[t.species] || 0) + 1; }); return { territories:actors.length, bySpecies }; }
