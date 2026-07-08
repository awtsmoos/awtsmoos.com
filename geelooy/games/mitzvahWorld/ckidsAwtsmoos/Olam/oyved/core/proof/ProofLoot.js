// B"H
/**
 * B"H
 *
 * Loot proof makes sure combat still leaves a usable vessel behind: an animal
 * can fall, become a corpse, open a payload, and transfer its reward.
 */
import { lootAll, lootPayload } from "../../../../systems/loot/LootRuntime.js?compact=true&v=final-lootable-corpse-20260705-bh1";
import { collectLootDiagnostics } from "../../../../systems/loot/LootDiagnostics.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { animals, sleep } from "./ProofCommon.js?compact=true&v=animal-realism-split-20260705-bh1";

export async function proveLoot(olam) {
  const live = animals(olam).filter(a => !a.userData?.health?.dead);
  const animal = live.find(a => a.userData?.motion?.species !== "fox") || live[0] || animals(olam)[0];
  if (!animal) return { ok:false, reason:"no-animal" };
  const name = animal.name;
  const beforeHp = { ...(animal.userData?.health || {}) };
  const hits = [];
  for (let i = 0; i < 12 && !animal.userData?.health?.dead && !animal.userData?.dead; i++) {
    hits.push(animal.takeDamage?.(99999, { source:"proof-loot", hit:i + 1 }));
    await sleep(70);
  }
  const corpseId = animal.userData?.lootableCorpseId || animal.lootableCorpseId;
  const opened = animal.ayshPeula?.("accepted interaction", { action:"accepted interaction", source:"proof-loot-click" });
  const payload = lootPayload(olam, corpseId);
  const all = lootAll(olam, corpseId);
  const diag = { at:Date.now(), animal:name, corpseId, beforeHp, hits, dead:Boolean(animal.userData?.dead || animal.userData?.health?.dead), lootable:Boolean(animal.userData?.lootable), corpseClicked:Boolean(opened), opened:Boolean(opened), payloadOpen:Boolean(payload?.open), lootAll:all, itemsAwarded:all?.itemsAwarded || [] };
  olam.__mitzvahLootDiag = diag;
  globalThis.__MITZVAH_LOOT_DIAG__ = () => diag;
  return { ok:Boolean(corpseId && diag.dead && diag.lootable && opened && payload?.open && all?.ok), ...diag, ...collectLootDiagnostics(olam) };
}

export default proveLoot;
