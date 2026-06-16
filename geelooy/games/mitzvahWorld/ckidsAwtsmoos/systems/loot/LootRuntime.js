// B"H
/** @file LootRuntime.js @description Solo starter corpse-loot loop: sparkle, money, quest items, rare bonus, loot-all, and empty corpse state. */
import { addBagItem } from "../inventory/BagRuntime.js";
import { lootForRare } from "./RareLootRuntime.js";
const EMPTY_LOOT_STATE = Object.freeze({ corpses:{} });
function playerOf(olam) { return olam?.player || olam?.chossid || olam || {}; }
function speciesOf(c) { return c?.def?.species || c?.mesh?.userData?.species || c?.species || "creature"; }
function rareIdOf(c) { return c?.rare?.id || c?.rareId || c?.mesh?.userData?.rareId || c?.id || "golden_deer"; }
function idOf(c) { return c?.id || c?.name || c?.mesh?.uuid || `corpse_${Date.now()}`; }
function baseDrops(species) { return ({ cow:["cow_hide"], deer:["healing_herb"], fox:["fur_scrap"], bird:["spark_fragment"], wolf:["fur_scrap"], creature:["spark_fragment"] }[species] || ["spark_fragment"]); }
export function ensureLootState(olam) { if (!olam) return EMPTY_LOOT_STATE; olam.__lootState ||= { corpses:{} }; return olam.__lootState; }
export function createLootTableForCreature(creature) { const species = speciesOf(creature), rare = creature?.rare || creature?.mesh?.userData?.rare; const items = baseDrops(species).map(id => ({ id, qty:1 })); if (rare) for (const id of lootForRare(rareIdOf(creature))) items.push({ id, qty:1, rare:true }); return { money:Math.max(1, Number(creature?.level || 1)), items }; }
export function makeLootableCorpse(olam, creature, context = {}) { const loot = ensureLootState(olam), corpseId = `loot_${idOf(creature)}`; if (Object.isFrozen(loot)) return false; loot.corpses[corpseId] = { corpseId, creatureName:creature?.name || speciesOf(creature), species:speciesOf(creature), at:Date.now(), table:createLootTableForCreature(creature), looted:false, context }; if (creature) creature.lootableCorpseId = corpseId; olam?.ayshPeula?.("ui event", "lootSparkle", lootSparklePayload(olam)); return loot.corpses[corpseId]; }
export function lootPayload(olam, corpseId) { const c = ensureLootState(olam).corpses[corpseId]; return c ? { open:true, ...c } : { open:false, reason:"missing-corpse", corpseId }; }
export function lootItem(olam, corpseId, itemId) { const c = ensureLootState(olam).corpses[corpseId]; if (!c || c.looted) return { ok:false, reason:"empty" }; const i = c.table.items.findIndex(x => x.id === itemId); if (i < 0) return { ok:false, reason:"missing-item" }; const [item] = c.table.items.splice(i, 1); addBagItem(olam, item.id); if (!c.table.items.length && !c.table.money) c.looted = true; return { ok:true, item, remaining:c.table.items.length }; }
export function lootAll(olam, corpseId) { const c = ensureLootState(olam).corpses[corpseId], p = playerOf(olam); if (!c || c.looted) return { ok:false, reason:"empty" }; for (const item of c.table.items) addBagItem(olam, item.id, { silent:true }); p.perutah = Number(p.perutah || 0) + Number(c.table.money || 0); c.table.items = []; c.table.money = 0; c.looted = true; olam?.ayshPeula?.("ui event", "loot", { corpseId, looted:true, perutah:p.perutah }); return { ok:true, corpseId, perutah:p.perutah }; }
export function lootSparklePayload(olam) { return { corpses:Object.values(ensureLootState(olam).corpses).filter(c => !c.looted).map(c => ({ corpseId:c.corpseId, name:c.creatureName, sparkle:true })) }; }
export default { ensureLootState, createLootTableForCreature, makeLootableCorpse, lootPayload, lootItem, lootAll, lootSparklePayload };
