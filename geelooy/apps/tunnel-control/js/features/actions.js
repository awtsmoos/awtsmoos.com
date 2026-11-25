// B"H

import { $, text } from "../lib/dom.js";
import { callFs, buildFsUrl } from "../api/tunnel.js";
import { show } from "../ui/api.js";
import { bindCatalogCards } from "./actionSelection.js";
import { buildOptions } from "./actionOptions.js";

/**
 * B"H
 * Chapter 806: The action catalog stopped dumping scrolls of JSON.
 *
 * Every run now produces one response card: one main instruction first, raw
 * diagnostics hidden below. Agents who miss the room/mission selection get sent
 * back to choose a room instead of drowning in repeated guidance.
 */
export function mountActions(getTunnelName) {
  bindCatalogCards();
  const run = $("runActionBtn");
  if (run) run.onclick = async () => runSelectedAction(getTunnelName);
  const copy = $("copyActionUrlBtn");
  if (copy) copy.onclick = async () => navigator.clipboard.writeText($("actionUrlOut").textContent);
  bindActionUrlPreview(getTunnelName);
}

/**
 * B"H — Run 09: the Action URL disclosure mirrors the CURRENT selection.
 *
 * It used to be written only inside runSelectedAction, so after a run it
 * kept showing the last EXECUTED action's URL (a stale chromeFind URL)
 * while the operator browsed List files / Browser doctor / mission
 * actions. Now the preview rebuilds from the pane's live fields whenever
 * the selection changes (catalog card click — this listener sits on the
 * grid, so it bubbles after the card's own selection handler has applied
 * the new action's fields) and whenever a field is edited.
 */
function bindActionUrlPreview(getTunnelName) {
  const refresh = () => {
    try {
      text("actionUrlOut", buildFsUrl(getTunnelName(), buildOptions()));
    } catch (error) {
      text("actionUrlOut", `Cannot build a URL for the current options: ${error.message}`);
    }
  };
  const grid = $("actionCatalogGrid");
  if (grid && !grid.dataset.awtUrlPreviewBound) {
    grid.dataset.awtUrlPreviewBound = "true";
    grid.addEventListener("click", refresh);
  }
  const detail = $("actionDetail");
  if (detail && !detail.dataset.awtUrlPreviewBound) {
    detail.dataset.awtUrlPreviewBound = "true";
    detail.addEventListener("input", refresh);
    detail.addEventListener("change", refresh);
  }
}

async function runSelectedAction(getTunnelName) {
  let opts;
  try { opts = buildOptions(); }
  catch (error) { return show("actionOut", { ok: false, error: error.message }); }
  openDetails("actionUrlOut");
  openDetails("actionOut");
  text("actionUrlOut", buildFsUrl(getTunnelName(), opts));
  text("actionOut", "Running...");
  show("actionOut", await callFs(getTunnelName(), opts));
}

function openDetails(id) {
  $(id)?.closest("details")?.setAttribute("open", "open");
}
