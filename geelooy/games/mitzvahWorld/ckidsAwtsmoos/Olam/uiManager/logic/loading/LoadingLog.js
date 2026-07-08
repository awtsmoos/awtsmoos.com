// B"H
/** Loader log: two lines only, so truth is visible and calm. */
import { IDS } from "./LoadingConstants.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { state } from "./LoadingState.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { text } from "./LoadingText.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
export function record(line) {
  const clean = String(line || "").replace(/\s+/g, " ").slice(0, 110);
  if (!clean || state.log.at(-1) === clean) return;
  state.log.push(clean);
  state.log = state.log.slice(-2);
  text(IDS.log, state.log.join("\n"));
}
