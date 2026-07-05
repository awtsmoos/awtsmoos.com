// B"H
/** @file LootDiagnostics.js @description Summarizes loot-to-quest proof. */
export function collectLootDiagnostics(olam) {
  return {
    ...(olam?.__mitzvahLootDiag || {}),
    ...(olam?.__lootQuestAwardDiag || {}),
    inventoryUpdated:Boolean(olam?.player?.inventory?.slots?.length || olam?.chossid?.inventory?.slots?.length),
    questItemRecognized:Boolean(olam?.__lootQuestAwardDiag?.questItemRecognized)
  };
}

export default { collectLootDiagnostics };
