// B"H
/** WildlifeTicker.js — one meadow heartbeat, throttled but alive. */
import { guardianWildlifeCadence } from "../RegionWildlifeData.js?v=mitzvah-aggressive-split-20260703-bh1";

export function installWildlifeTicker(olam, root) {
  if (!olam || !root?.userData?.tick) return null;
  if (olam.__livingRegionWildlifeTicker) return olam.__livingRegionWildlifeTicker;
  let acc = 0;
  const ticker = {
    name: "living_region_wildlife_ticker",
    type: "livingRegionTicker",
    isReady: true,
    heesHawveh: true,
    heesHawvoos(dt) {
      acc += Number(dt) || 0;
      const cadence = guardianWildlifeCadence();
      if (acc < cadence) return;
      const step = Math.min(cadence * 1.35, acc);
      acc = 0;
      root.userData.tick(step);
      ticker.lastTickAt = Date.now();
      ticker.lastStep = step;
      ticker.tickCount = (ticker.tickCount || 0) + 1;
    }
  };
  olam.__livingRegionWildlifeTicker = ticker;
  olam.__livingRegionWildlifeRoot = root;
  if (Array.isArray(olam.nivrayim) && !olam.nivrayim.includes(ticker)) olam.nivrayim.push(ticker);
  return ticker;
}
