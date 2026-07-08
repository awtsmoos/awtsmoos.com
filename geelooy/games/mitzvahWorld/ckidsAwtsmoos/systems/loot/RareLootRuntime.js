// B"H
/** @file RareLootRuntime.js @description Rare loot tables, reward helpers, and solo-visible treasure payloads. */
import { collectItems } from "./CollectRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
export const RareLootTables = Object.freeze({ golden_deer:["spark_fragment", "sefer_tehillim"], white_fox:["spark_fragment", "fox_cloak_thread"], lost_traveler:["siddur_page", "traveler_letter"], great_fox:["fox_cloak_thread", "spark_fragment"] });
export function lootForRare(rareId) { return RareLootTables[rareId] || ["spark_fragment"]; }
export function rareLootPayload(rareId) { return { rareId, items:lootForRare(rareId), sparkle:true }; }
export function collectRareLoot(olam, rareId) { const items = lootForRare(rareId); const collected = collectItems(olam, items); olam?.ayshPeula?.("ui event", "rareLoot", { rareId, items }); return collected; }
export default { RareLootTables, lootForRare, rareLootPayload, collectRareLoot };
