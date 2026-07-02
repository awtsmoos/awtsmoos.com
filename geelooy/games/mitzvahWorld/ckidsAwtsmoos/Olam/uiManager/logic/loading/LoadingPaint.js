// B"H
/** Paint loop: stage progress may rise to 98, but never fake the throne. */
import { IDS, FINAL, HELD } from "./LoadingConstants.js";
import { clamp } from "./LoadingDom.js";
import { state, rememberRealProgress, hold } from "./LoadingState.js";
import { stagePercent } from "./LoadingStages.js";
import { label } from "./LoadingLabels.js";
import { bar } from "./LoadingBars.js";
import { text } from "./LoadingText.js";
import { record } from "./LoadingLog.js";
import { finish } from "./LoadingFinish.js";
export function paint(input = {}) {
  if (typeof document === "undefined" || state.hidden) return;
  const stage = String(input.stage || input.kind || "progress");
  state.rawStage = stage;
  if (!input.synthetic) rememberRealProgress();
  if (FINAL.test(stage)) return finish(stage);
  if (HELD.test(stage)) hold(`held:${stage}`);
  const percent = Math.min(98, input.total ?? input.amount ?? stagePercent(stage));
  bar("total", percent);
  if (stage.includes("world") || stage.includes("load") || stage.includes("postbuild") || input.world != null) {
    bar("world", Math.min(98, input.world ?? percent));
  }
  if (input.worker != null || stage) bar("worker", Math.min(98, input.worker ?? percent));
  if (stage.includes("texture") || input.texture != null) bar("texture", Math.min(98, input.texture ?? input.percent ?? percent));
  const message = HELD.test(stage) ? "Waiting for first playable frame" : label(stage, input);
  text(IDS.percent, `${Math.round(state.total)}%`);
  text(IDS.action, input.action || message);
  text(IDS.sub, input.subAction || message);
  text(IDS.workerText, message);
  if (stage.includes("texture")) text(IDS.textureText, message);
  record(input.log || message);
}
