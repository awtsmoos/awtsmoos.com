// B"H
/** WildlifeProofRegistry.js — publish inspectable worker-side wildlife proof. */
import { publishWildlifeRuntimeReport } from "../../wildlife/WildlifeRuntimeReport.js?v=mitzvah-aggressive-split-20260703-bh1";

function animalsOf(root) { return Array.from(root?.children || []).filter(child => child?.userData?.motion); }

export function wildlifeDiag(root, olam) {
  const animals = animalsOf(root);
  return {
    rootName: root?.name || null,
    animals: animals.length,
    firstPlayableCount: root?.userData?.firstPlayableCount || 0,
    streamingRemaining: root?.userData?.streamingRemaining || 0,
    streamedAnimals: root?.userData?.streamedAnimals || 0,
    tickerLastTickAt: olam?.__livingRegionWildlifeTicker?.lastTickAt || null,
    stats: root?.userData?.stats || null,
    report: root?.userData?.visibleWildlifeReport || null,
    seal: "wildlife-proof-registry-bh1"
  };
}

export function registerForProof(root, olam) {
  const scope = globalThis;
  scope.__MITZVAH_WILDLIFE_ROOTS__ ||= [];
  if (!scope.__MITZVAH_WILDLIFE_ROOTS__.includes(root)) scope.__MITZVAH_WILDLIFE_ROOTS__.push(root);
  scope.__MITZVAH_REGISTERED_WILDLIFE__ = animalsOf(root);
  scope.__MITZVAH_WILDLIFE_DIAG__ = () => wildlifeDiag(root, olam);
  olam && (olam.__mitzvahWildlifeDiag = () => wildlifeDiag(root, olam));
  scope.__MITZVAH_REGISTERED_WILDLIFE__.forEach(child => scope.__MITZVAH_REGISTER_ANIMAL__?.(child));
  scope.__MITZVAH_SCAN_ANIMALS__?.();
  return publishWildlifeRuntimeReport(root, olam);
}
