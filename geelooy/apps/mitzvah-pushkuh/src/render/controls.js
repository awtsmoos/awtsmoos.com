// B"H
// Controls let the user choose a ritual without drowning in machinery.
import { paths, rituals } from "../concepts.js";
import { el, esc, fillSelect, setActive } from "./dom.js";
let needle = "";
export function bootControls(onRitual, onFilter) {
  fillSelect("type", paths); drawRituals(onRitual);
  el("ritualSearch").oninput = e => { needle = e.target.value.toLowerCase(); drawRituals(onRitual); };
  el("filters").onclick = e => { const b = e.target.closest("button"); if (!b) return; setActive(el("filters"), b); onFilter(b.dataset.filter); };
  return rituals[0].id;
}
function drawRituals(onRitual) {
  const box = el("rituals"), rows = rituals.filter(match).slice(0, 18);
  box.innerHTML = rows.map((r, i) => `<button class="chip ${i ? "" : "active"}" data-id="${esc(r.id)}" title="${esc(r.story)}">${esc(r.name)}</button>`).join("");
  box.onclick = e => { const b = e.target.closest("button"); if (!b) return; setActive(box, b); onRitual(b.dataset.id); };
}
function match(r) { return !needle || `${r.name} ${r.story} ${r.id}`.toLowerCase().includes(needle); }
