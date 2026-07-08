// B"H
/** Paint loop: master/category bars are monotonic and separately meaningful. */
import { IDS, FINAL, HELD } from "./LoadingConstants.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { state, rememberRealProgress, hold } from "./LoadingState.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { stagePercent } from "./LoadingStages.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { label } from "./LoadingLabels.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { bar } from "./LoadingBars.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { text } from "./LoadingText.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { record } from "./LoadingLog.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { finish } from "./LoadingFinish.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

function categoryValues(stage, input, percent) {
  const lower = String(stage || "").toLowerCase();
  const worldStage = /world|load|nivrayim|postbuild|terrain|render|playable|canvas/.test(lower);
  const workerStage = /worker|entrypoint|message|vessel|engine|pawsawch|oyved/.test(lower);
  const textureStage = /texture|paint|material|terrain/.test(lower);
  return {
    world:Math.min(98, input.world ?? (worldStage ? percent : state.world)),
    worker:Math.min(98, input.worker ?? (workerStage ? Math.max(percent, 12) : state.worker)),
    texture:Math.min(98, input.texture ?? input.texturePercent ?? (textureStage ? Math.max(input.percent ?? percent, 8) : state.texture))
  };
}

export function paint(input = {}) {
  if (typeof document === "undefined" || state.hidden) return;
  const stage = String(input.stage || input.kind || "progress");
  state.rawStage = stage;
  if (!input.synthetic) rememberRealProgress(stage);
  if (FINAL.test(stage)) return finish(stage);
  if (HELD.test(stage)) hold(`held:${stage}`);

  const percent = Math.min(98, input.total ?? input.amount ?? stagePercent(stage));
  const categories = categoryValues(stage, input, percent);
  bar("total", percent);
  bar("world", categories.world);
  bar("worker", categories.worker);
  bar("texture", categories.texture);

  const message = HELD.test(stage) ? "Waiting for first playable frame" : label(stage, input);
  const worldMessage = input.subAction || (categories.world >= 90 ? "World geometry ready; verifying playable frame." : message);
  const workerMessage = input.workerLabel || (categories.worker >= 90 ? "Worker running." : message);
  const textureMessage = input.textureLabel || (categories.texture > 0 ? "Textures streaming without blocking play." : "queued");
  text(IDS.percent, `${Math.round(state.total)}%`);
  text(IDS.action, input.action || message);
  text(IDS.sub, worldMessage);
  text(IDS.workerText, workerMessage);
  text(IDS.textureText, textureMessage);
  record(input.log || message);
}
