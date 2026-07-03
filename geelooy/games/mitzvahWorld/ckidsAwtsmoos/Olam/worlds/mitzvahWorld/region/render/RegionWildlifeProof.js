// B"H
/**
 * @file RegionWildlifeProof.js
 * @description
 * Wildlife proof and tick installation. The Awtsmoos records the herd, exposes
 * it to audits, and advances it only on the guardian cadence.
 */
import { publishWildlifeRuntimeReport } from "../wildlife/WildlifeRuntimeReport.js?v=perf-tight-collision-20260703-bh3";
import { guardianWildlifeCadence } from "./RegionWildlifeData.js?v=perf-tight-collision-20260703-bh3";

export function registerForProof(root, olam) {
  const scope = globalThis;
  scope.__MITZVAH_WILDLIFE_ROOTS__ ||= [];
  if (!scope.__MITZVAH_WILDLIFE_ROOTS__.includes(root)) {
    scope.__MITZVAH_WILDLIFE_ROOTS__.push(root);
  }
  scope.__MITZVAH_REGISTERED_WILDLIFE__ ||= [];
  root.children.forEach(child => {
    if (!scope.__MITZVAH_REGISTERED_WILDLIFE__.includes(child)) {
      scope.__MITZVAH_REGISTERED_WILDLIFE__.push(child);
    }
    scope.__MITZVAH_REGISTER_ANIMAL__?.(child);
  });
  scope.__MITZVAH_SCAN_ANIMALS__?.();
  publishWildlifeRuntimeReport(root, olam);
}

export function installWildlifeTicker(olam, root) {
  if (!olam || !root?.userData?.tick || olam.__livingRegionWildlifeTicker) return;
  let acc = 0;
  const ticker = {
    name: "living_region_wildlife_ticker",
    type: "livingRegionTicker",
    isReady: true,
    heesHawveh: true,
    heesHawvoos: dt => {
      acc += Number(dt) || 0;
      const cadence = guardianWildlifeCadence();
      if (acc < cadence) return;
      const step = Math.min(cadence * 1.35, acc);
      acc = 0;
      root.userData.tick(step);
    }
  };
  olam.__livingRegionWildlifeTicker = ticker;
  olam.__livingRegionWildlifeRoot = root;
  if (Array.isArray(olam.nivrayim) && !olam.nivrayim.includes(ticker)) {
    olam.nivrayim.push(ticker);
  }
}
