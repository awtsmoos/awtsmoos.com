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
