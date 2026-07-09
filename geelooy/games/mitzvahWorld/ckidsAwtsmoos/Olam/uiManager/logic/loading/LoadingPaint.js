// B"H
/** Paint loop: master/category bars are monotonic and descriptive. */
import { IDS, FINAL, HELD } from './LoadingConstants.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { state, rememberRealProgress, hold } from './LoadingState.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { stagePercent } from './LoadingStages.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { label, detail, logLine } from './LoadingLabels.js?compact=true&v=loader-text-detail-20260708-bh5';
import { bar } from './LoadingBars.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { text } from './LoadingText.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { record } from './LoadingLog.js?compact=true&v=loader-text-detail-20260708-bh5';
import { finish } from './LoadingFinish.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

function categoryValues(stage, input, percent) {
  const lower = String(stage || '').toLowerCase();
  const worldStage = /world|load|nivrayim|postbuild|terrain|render|playable|canvas|entity|npc|house|tree/.test(lower);
  const workerStage = /worker|entrypoint|message|vessel|engine|pawsawch|oyved|graft|boot|module/.test(lower);
  const textureStage = /texture|paint|material|terrain|leaf|bark/.test(lower);
  return {
    world: Math.min(98, input.world ?? (worldStage ? percent : state.world)),
    worker: Math.min(98, input.worker ?? (workerStage ? Math.max(percent, 12) : state.worker)),
    texture: Math.min(98, input.texture ?? input.texturePercent ?? (textureStage ? Math.max(input.percent ?? percent, 8) : state.texture))
  };
}

function fatal(stage) { return /fatal|error|oyved_import|syntaxerror/i.test(String(stage || '')); }
function shownPercent() { return `${Math.round(state.total)}%`; }

export function paint(input = {}) {
  if (typeof document === 'undefined' || state.hidden) return;
  const stage = String(input.stage || input.kind || 'progress');
  state.rawStage = stage;
  if (!input.synthetic) rememberRealProgress(stage);
  if (FINAL.test(stage)) return finish(stage);
  if (HELD.test(stage)) hold(`held:${stage}`);

  const percent = Math.min(98, input.total ?? input.amount ?? stagePercent(stage));
  const categories = categoryValues(stage, input, percent);
  bar('total', percent);
  bar('world', categories.world);
  bar('worker', categories.worker);
  bar('texture', categories.texture);

  const title = HELD.test(stage) ? 'Waiting for first playable frame' : label(stage, input);
  const detailText = input.subAction || detail(stage, input);
  const workerText = input.workerLabel || (fatal(stage) ? 'Worker stopped; diagnostic exposed.' : `Worker: ${title}`);
  const textureText = input.textureLabel || (categories.texture > 0 ? `Textures/materials: ${Math.round(categories.texture)}%` : 'Textures/materials: queued');
  text(IDS.percent, shownPercent());
  text(IDS.action, input.action || title);
  text(IDS.sub, detailText);
  text(IDS.workerText, workerText);
  text(IDS.textureText, textureText);
  record(input.log || logLine(stage, input));
}
