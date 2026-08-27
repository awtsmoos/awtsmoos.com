// B"H
// Render bridge: storytelling now lives in smaller vessels.
import { dayPrompt } from "./concepts.js";
import { filtered, oracle, stats } from "./state.js";
import { set } from "./render/dom.js";
import { bootControls } from "./render/controls.js";
import { renderArchive } from "./render/archive.js";
import { renderConstellations } from "./render/constellations.js";
import { renderDetail } from "./render/detail.js";
import { clearForm, formValues } from "./render/form.js";

export { bootControls, clearForm, formValues, renderDetail };
export function render(entries, filter, onOpen) {
  const s = stats(entries);
  set("total", s.total); set("alive", s.alive); set("fulfilled", s.fulfilled);
  set("dormant", s.dormant); set("tended", s.tended); set("paths", s.paths);
  set("oracle", oracle(entries)); set("dailyPrompt", dayPrompt());
  renderArchive(filtered(entries, filter), onOpen); renderConstellations(entries);
}
