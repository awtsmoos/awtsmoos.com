// B"H
/** Stage math: real progress is mapped, never invented as completion. */
import { POINTS } from "./LoadingConstants.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { state } from "./LoadingState.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
export function stagePercent(stage) {
  const name = String(stage || "");
  for (const [prefix, amount] of POINTS) if (name.startsWith(prefix)) return amount;
  return state.total;
}
