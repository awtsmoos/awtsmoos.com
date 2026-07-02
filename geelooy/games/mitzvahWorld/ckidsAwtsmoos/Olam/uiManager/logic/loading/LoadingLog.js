// B"H
/** Loader log: two lines only, so truth is visible and calm. */
import { IDS } from "./LoadingConstants.js";
import { state } from "./LoadingState.js";
import { text } from "./LoadingText.js";
export function record(line) {
  const clean = String(line || "").replace(/\s+/g, " ").slice(0, 110);
  if (!clean || state.log.at(-1) === clean) return;
  state.log.push(clean);
  state.log = state.log.slice(-2);
  text(IDS.log, state.log.join("\n"));
}
