// B"H
// The archive is a forest, not a spreadsheet.
import { describe, stage } from "../state.js";
import { el, esc } from "./dom.js";

export function renderArchive(rows, onOpen) {
  const box = el("entries");
  box.innerHTML = rows.map(card).join("") || "<p class='meta'>No sparks here yet. Plant one into the garden.</p>";
  box.onclick = e => { const id = e.target.closest(".entry")?.dataset.id; if (id) onOpen(id); };
}
function card(entry) {
  const d = describe(entry), life = stage(entry)[0];
  return `<button class="entry ${entry.status.toLowerCase()} ${life}" data-id="${esc(entry.id)}"><b>${esc(entry.title)}</b><p class="meta">${esc(entry.type)} · ${esc(d.ritual.name)} · ${esc(d.age)}</p><div class="meter"><span style="width:${d.resonance}%"></span></div><span class="stage">${esc(life)}</span></button>`;
}
