// B"H
/** Stage math: real progress is mapped, never invented as completion. */
import { POINTS } from "./LoadingConstants.js";
import { state } from "./LoadingState.js";
export function stagePercent(stage) {
  const name = String(stage || "");
  for (const [prefix, amount] of POINTS) if (name.startsWith(prefix)) return amount;
  return state.total;
}
