// B"H
/**
 * @file LootRuntime.js
 * @description
 * Chapter 412: The corpse no longer mints a private shadow currency.
 *
 * Loot remains the starter corpse loop: sparkle, items, rare drops, loot-all,
 * empty corpse state. But money now enters the same PersonalPerutaWallet used by
 * shops, doors, missions, repairs, and hazards. The old `perutah` field is still
 * mirrored by that wallet, so legacy callers see the same value without owning a
 * second purse.
 */
import { addBagItem } from "../inventory/BagRuntime.js?v=final-lootable-corpse-20260705-bh1";
import {
  awardMoney,
  moneyOf,
  walletPlayerOf
} from "../economy/wallet/PersonalPerutaWallet.js";
import { lootForRare } from "./RareLootRuntime.js";
import { dropsForAnimal } from "./AnimalDropTable.js";
import { awardLootItemsToQuests } from "./LootAwardRuntime.js";

const EMPTY_LOOT_STATE = Object.freeze({ corpses: {} });
const n = value => Number.isFinite(Number(value)) ? Number(value) : 0;

function speciesOf(c) { return c?.def?.species || c?.mesh?.userData?.species || c?.species || "creature"; }
function rareIdOf(c) { return c?.rare?.id || c?.rareId || c?.mesh?.userData?.rareId || c?.id || "golden_deer"; }
function idOf(c) { return c?.id || c?.name || c?.mesh?.uuid || `corpse_${Date.now()}`; }
function baseDrops(species) { return dropsForAnimal(species); }

export function ensureLootState(olam) { if (!olam) return EMPTY_LOOT_STATE; olam.__lootState ||= { corpses:{} }; return olam.__lootState; }
export function createLootTableForCreature(creature) { const species = speciesOf(creature), rare = creature?.rare || creature?.mesh?.userData?.rare; const items = baseDrops(species).map(id => ({ id, qty:1 })); if (rare) for (const id of lootForRare(rareIdOf(creature))) items.push({ id, qty:1, rare:true }); return { money:Math.max(1, n(creature?.level || 1)), items }; }
export function makeLootableCorpse(olam, creature, context = {}) { const loot = ensureLootState(olam), corpseId = `loot_${idOf(creature)}`; if (Object.isFrozen(loot)) return false; loot.corpses[corpseId] = { corpseId, creatureName:creature?.name || speciesOf(creature), species:speciesOf(creature), at:Date.now(), table:createLootTableForCreature(creature), looted:false, context }; if (creature) creature.lootableCorpseId = corpseId; olam?.ayshPeula?.("ui event", "lootSparkle", lootSparklePayload(olam)); return loot.corpses[corpseId]; }
export function lootPayload(olam, corpseId) { const c = ensureLootState(olam).corpses[corpseId]; return c ? { open:true, ...c } : { open:false, reason:"missing-corpse", corpseId }; }
export function lootItem(olam, corpseId, itemId) { const c = ensureLootState(olam).corpses[corpseId]; if (!c || c.looted) return { ok:false, reason:"empty" }; const i = c.table.items.findIndex(x => x.id === itemId); if (i < 0) return { ok:false, reason:"missing-item" }; const [item] = c.table.items.splice(i, 1); addBagItem(olam, item.id); if (!c.table.items.length && !c.table.money) c.looted = true; return { ok:true, item, remaining:c.table.items.length }; }
export function lootAll(olam, corpseId) { const c = ensureLootState(olam).corpses[corpseId], p = walletPlayerOf(olam); if (!c || c.looted) return { ok:false, reason:"empty" }; const awardedItems = c.table.items.map(item => ({ ...item })); for (const item of awardedItems) addBagItem(olam, item.id, { silent:true }); awardLootItemsToQuests(olam, awardedItems); const perutah = awardMoney(p, n(c.table.money), "loot all"); c.table.items = []; c.table.money = 0; c.looted = true; olam?.ayshPeula?.("ui event", "loot", { corpseId, looted:true, itemsAwarded:awardedItems.map(i => i.id), perutah:moneyOf(p), personalPerutas:perutah }); return { ok:true, corpseId, itemsAwarded:awardedItems.map(i => i.id), perutah:moneyOf(p), personalPerutas:perutah }; }
export function lootSparklePayload(olam) { return { corpses:Object.values(ensureLootState(olam).corpses).filter(c => !c.looted).map(c => ({ corpseId:c.corpseId, name:c.creatureName, sparkle:true })) }; }

export default { ensureLootState, createLootTableForCreature, makeLootableCorpse, lootPayload, lootItem, lootAll, lootSparklePayload };
