// B"H
/**
 * @file InterestTierScheduler.js
 * Scheduler of nearness: souls close to the player speak often; distant hills are
 * remembered statistically until the player walks there.
 */
function dist2(a = {}, b = {}) {
  const dx = (a.x || 0) - (b.x || 0);
  const dz = (a.z || 0) - (b.z || 0);
  return dx * dx + dz * dz;
}
export function classifyInterestTier(entity = {}, player = {}, policy = {}) {
  const d = Math.sqrt(dist2(entity.position || entity.mesh?.position || entity, player.position || player.mesh?.position || player));
  const near = policy.nearDistance || 70;
  const mid = policy.midDistance || 180;
  const far = policy.farDistance || 420;
  if (d <= near) return { tier:"near", distance:d, hz:policy.nearHz || 30, visible:true };
  if (d <= mid) return { tier:"mid", distance:d, hz:policy.midHz || 4, visible:true };
  if (d <= far) return { tier:"far", distance:d, hz:policy.farHz || 1, visible:false };
  return { tier:"horizon", distance:d, hz:0, visible:false, statistical:true };
}
export function shouldRunTier(nowMs, item) {
  const hz = Number(item?.interest?.hz ?? item?.hz ?? 0);
  if (hz <= 0) return false;
  const interval = 1000 / hz;
  if (!item._awtsmoosLastRun || nowMs - item._awtsmoosLastRun >= interval) {
    item._awtsmoosLastRun = nowMs;
    return true;
  }
  return false;
}
export function makeInterestTierScheduler(policy = {}) {
  const tracked = new Set();
  return {
    add(item) { tracked.add(item); return item; },
    delete(item) { tracked.delete(item); },
    clear() { tracked.clear(); },
    update(player, nowMs = performance.now()) {
      const runnable = [];
      for (const item of tracked) {
        item.interest = classifyInterestTier(item, player, policy);
        if (shouldRunTier(nowMs, item)) runnable.push(item);
      }
      return runnable;
    },
    report() {
      const counts = { near:0, mid:0, far:0, horizon:0 };
      for (const item of tracked) counts[item.interest?.tier || "horizon"] += 1;
      return { tracked:tracked.size, counts };
    }
  };
}
export default makeInterestTierScheduler;
