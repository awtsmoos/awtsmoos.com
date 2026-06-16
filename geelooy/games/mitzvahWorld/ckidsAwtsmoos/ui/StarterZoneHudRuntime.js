// B"H
/** @file StarterZoneHudRuntime.js @description One compact starter HUD payload joining gossip, quests, minimap, loot, death, nameplates, castbars, and service panels. */
import { questTrackerPayload } from "../systems/missions/QuestTrackerRuntime.js";
import { questMarkersPayload } from "../systems/missions/QuestMarkerRuntime.js";
import { minimapPayload } from "./MinimapRuntime.js";
import { lootSparklePayload } from "../systems/loot/LootRuntime.js";
import { spiritHealerPayload } from "../systems/death/SpiritHealerRuntime.js";
import { emitNameplates, nameplatePayload } from "./NameplateRuntime.js";
import { castBarPayload } from "./CastBarRuntime.js";
function targetsOf(olam) { return olam?.combatManager?.targets?.() || olam?.combatManager?.enemies || olam?.enemies || []; }
export function starterZoneHudPayload(olam) { const targets = targetsOf(olam); return { questTracker:questTrackerPayload(olam), questMarkers:questMarkersPayload(olam), minimap:minimapPayload(olam), loot:lootSparklePayload(olam), spiritHealer:spiritHealerPayload(olam), nameplates:nameplatePayload(targets), castbar:castBarPayload(olam?.__castingEnemy, olam?.__activeEnemyCast), activeNpc:olam?.__activeNpcInteraction || null }; }
export function emitStarterZoneHud(olam) { const payload = starterZoneHudPayload(olam); olam?.ayshPeula?.("ui event", "starterZoneHud", payload); emitNameplates(olam, targetsOf(olam)); return payload; }
export function installStarterZoneHudBridge(scope = globalThis, olamGetter = () => scope.olam || scope.__AWTSMOOS_OLAM__) { if (scope.__MITZVAH_STARTER_HUD__) return scope.__MITZVAH_STARTER_HUD__; const api = { snapshot:() => starterZoneHudPayload(olamGetter()), emit:() => emitStarterZoneHud(olamGetter()) }; scope.__MITZVAH_STARTER_HUD__ = api; return api; }
export default { starterZoneHudPayload, emitStarterZoneHud, installStarterZoneHudBridge };
