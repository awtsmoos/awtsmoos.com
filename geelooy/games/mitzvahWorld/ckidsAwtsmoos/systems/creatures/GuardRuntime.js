// B"H
/** @file GuardRuntime.js @description Village guards protect solo-safe roads and warn before danger. */
import { forceAggro } from "./AggroRuntime.js";
export const GuardRegistry = Object.freeze([{ id:"village_guard", name:"Village Guard", radius:45 }, { id:"road_guard", name:"Road Guard", radius:32 }]);
export function guardWarn(olam, guardId = "village_guard", text = "Danger nearby") { const guard = GuardRegistry.find(g => g.id === guardId) || GuardRegistry[0]; olam?.ayshPeula?.("ui event", "guardWarning", { guard, text }); return { guard, text }; }
export function guardAssist(olam, guard, creature) { if (creature) forceAggro(creature, guard?.id || "guard", "guard-assist", 5); olam?.ayshPeula?.("ui event", "guardAssist", { guard:guard?.id || guard?.name, target:creature?.name }); return true; }
export default { GuardRegistry, guardWarn, guardAssist };
