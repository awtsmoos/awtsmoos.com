// B"H
/** @file CommandRuntime.js @description Slash commands for chat, Torah, farming, strict collect/talk, kosher craft, services, and missions. */
import { addChatMessage, openChat } from "./ChatRuntime.js";
import { openBag } from "../inventory/BagRuntime.js";
import { buyItem, equipItem } from "../equipment/EquipmentRuntime.js";
import { openTorahCodex, castTorahSlot } from "../torah/TorahActionRuntime.js";
import { readSefer, learnPassage } from "../torah/TorahSpellbookRuntime.js";
import { missionUiPayload } from "../missions/MissionRuntime.js";
import { progressActiveObjectives } from "../missions/MissionObjectiveRuntime.js";
import { performDelivery } from "../missions/DeliveryRuntime.js";
import { performTalk } from "../npc/NpcInteractionRuntime.js";
import { farmAction } from "../farming/FarmInteractionRuntime.js";
import { beginSeparation, doSeparationStep } from "../halacha/TerumahMaaserRuntime.js";
import { collectFromNearbySource } from "../loot/CollectSourceRuntime.js";
import { openCarcassUi } from "../kosher/CarcassRuntime.js";
import { processNearestCarcass } from "../kosher/KosherProcessingRuntime.js";
import { craftTefillin, sellTefillin } from "../kosher/TefillinCraftingRuntime.js";
import { openVendor } from "../social/VendorRuntime.js";
import { restAtInn } from "../social/InnRuntime.js";
import { openMailbox } from "../social/MailboxRuntime.js";
import { openBank } from "../social/BankRuntime.js";
import { repairThing } from "../social/RepairRuntime.js";
function playerOf(olam) { return olam?.player || olam?.chossid || null; }
function say(olam, tab, text, options = {}) { return addChatMessage(olam, tab, text, options); }
function coords(olam) { const p = playerOf(olam)?.mesh?.position || {}; return `${Math.round(p.x || 0)}, ${Math.round(p.y || 0)}, ${Math.round(p.z || 0)}`; }
function missionLine(olam) { const p = missionUiPayload(olam); return p.active?.[0]?.title || "No active shlichus"; }
const HELP = "/help /coords /level /bag /spellbook /buy shechita_knife /equip shechita_knife /carcass /process basar_shechuta|leather /craft tefillin /sell tefillin /collect <item> /talk <npc> /cast <slot> /plant /water /harvest /separate /deliver /repair /vendor /inn /mail /bank";
export function executeCommand(olam, line = "", source = "chat") {
  const raw = String(line || "").trim(); if (!raw) return false;
  if (!raw.startsWith("/")) return say(olam, "General", raw, { source }), true;
  const [cmd, ...rest] = raw.slice(1).split(/\s+/), arg = rest.join(" ").trim();
  switch ((cmd || "").toLowerCase()) {
    case "help": return say(olam, "System", HELP, { overlay:true }), true;
    case "stuck": playerOf(olam)?.mesh?.position?.set?.(0, 2, 0); return say(olam, "System", "Returned to safe village center.", { overlay:true }), true;
    case "coords": return say(olam, "System", `Coords: ${coords(olam)}`), true;
    case "level": { const p = playerOf(olam) || {}; return say(olam, "System", `Level ${p.level || 1} • XP ${p.xp || 0}/${p.xpToNext || 120}`), true; }
    case "mission": return say(olam, "Shlichus", missionLine(olam), { overlay:true }), true;
    case "missions": openChat(olam, "Shlichus"); return say(olam, "Shlichus", missionLine(olam)), true;
    case "bag": openBag(olam); return say(olam, "System", "Bag opened."), true;
    case "buy": return buyItem(olam, arg || "shechita_knife") ? say(olam, "System", `Bought ${arg || "shechita_knife"}.`) : say(olam, "System", `Could not buy ${arg}.`), true;
    case "equip": return equipItem(olam, arg || "shechita_knife") ? say(olam, "System", `Equipped ${arg || "shechita_knife"}.`) : say(olam, "System", `Could not equip ${arg}.`), true;
    case "carcass": { const p = openCarcassUi(olam); return say(olam, "System", p.open ? "Carcass opened." : "No nearby carcass."), true; }
    case "process": { const r = processNearestCarcass(olam, arg || "basar_shechuta"); return say(olam, "System", r.ok ? "Carcass processed." : `Processing blocked: ${r.reason}.`), true; }
    case "craft": { const r = arg === "tefillin" ? craftTefillin(olam) : { ok:false, reason:"unknown-recipe" }; return say(olam, "System", r.ok ? "Crafted tefillin." : `Craft blocked: ${r.reason}.`), true; }
    case "sell": { const r = arg === "tefillin" ? sellTefillin(olam) : { ok:false, reason:"unknown-sale" }; return say(olam, "System", r.ok ? `Sold tefillin. Perutah: ${r.perutah}.` : `Sell blocked: ${r.reason}.`), true; }
    case "spellbook": openTorahCodex(olam); return say(olam, "Torah", "Torah spellbook opened."), true;
    case "read": return readSefer(olam, arg || "siddur") ? say(olam, "Torah", `Reading ${arg || "siddur"}.`) : say(olam, "Torah", `No sefer named ${arg}.`), true;
    case "learn": return learnPassage(olam, arg) ? say(olam, "Torah", `Learning ${arg}.`) : say(olam, "Torah", `No passage named ${arg}.`), true;
    case "collect": { const r = collectFromNearbySource(olam, arg || "spark_fragment"); return say(olam, "System", r.ok ? `Collected ${arg || "spark_fragment"}.` : `Collect blocked: ${r.reason}.`), true; }
    case "talk": { const r = performTalk(olam, arg); return say(olam, "General", r.ok ? `You speak with ${r.npc.name || r.npc.role || "the nearby villager"}.` : `Talk blocked: ${r.reason}.`), true; }
    case "cast": return castByArg(olam, arg), true;
    case "target": if (arg === "nearest") olam.combatManager?.cycleTarget?.(); progressActiveObjectives(olam, "target", 1); return say(olam, "Combat", "Target nearest."), true;
    case "attack": olam.combatManager?.attack?.({ source }); progressActiveObjectives(olam, "attack", 1); return say(olam, "Combat", "Attack."), true;
    case "farm": return say(olam, "System", "Farm commands: /plant wheat, /water, /harvest, /separate"), true;
    case "plant": farmAction(olam, "plant", arg.split(" ")[1] || Object.keys(olam.__farmState?.plots || {})[0], arg.split(" ")[0] || "wheat"); return say(olam, "System", "Planting attempted."), true;
    case "water": farmAction(olam, "water", arg || Object.keys(olam.__farmState?.plots || {})[0]); return say(olam, "System", "Watering attempted."), true;
    case "harvest": farmAction(olam, "harvest", arg || Object.keys(olam.__farmState?.plots || {})[0]); return say(olam, "System", "Harvest attempted."), true;
    case "separate": beginSeparation(olam, arg || null) || doSeparationStep(olam); return say(olam, "Torah", "Separation step attempted."), true;
    case "maaser": if (arg === "status") return say(olam, "Torah", JSON.stringify(playerOf(olam)?.separationState || {})), true; return say(olam, "Torah", "Use /maaser status"), true;
    case "deliver": { const result = performDelivery(olam); return say(olam, "Shlichus", result.ok ? "Delivery offered." : `Delivery blocked: ${result.reason || result.blocked?.[0]?.target || "not at target"}`), true; }
    case "repair": repairThing(olam, arg || "fence"); progressActiveObjectives(olam, "repairFence", 1); return say(olam, "System", "Repair attempted."), true;
    case "vendor": openVendor(olam); progressActiveObjectives(olam, "vendor", 1); return say(olam, "System", "Vendor opened."), true;
    case "inn": restAtInn(olam); progressActiveObjectives(olam, "inn", 1); return say(olam, "System", "Rested."), true;
    case "mail": openMailbox(olam); progressActiveObjectives(olam, "mail", 1); return say(olam, "System", "Mailbox opened."), true;
    case "bank": openBank(olam); progressActiveObjectives(olam, "bank", 1); return say(olam, "System", "Bank opened."), true;
    default: return say(olam, "System", `Unknown command: /${cmd}. ${HELP}`, { overlay:true, color:"#ff9966" }), false;
  }
}
function castByArg(olam, arg) { const directSlot = Number(arg); if (Number.isFinite(directSlot) && directSlot >= 1 && directSlot <= 9) { castTorahSlot(olam, directSlot); return say(olam, "Torah", `Casting slot ${directSlot}.`); } const p = playerOf(olam), wanted = String(arg || "").toLowerCase(); const found = Object.values(p?.spellbook?.learned || {}).find(e => e.move?.name?.toLowerCase() === wanted || e.id?.toLowerCase() === wanted); if (!found) return say(olam, "Torah", `No learned passage named ${arg}.`, { overlay:true, color:"#ff9966" }); const slot = p.torahActionBar?.slots?.find(s => s.passageId === found.id)?.slot || 1; castTorahSlot(olam, slot); return say(olam, "Torah", `Casting ${found.move.name}.`); }
export default { executeCommand };
