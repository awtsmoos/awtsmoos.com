// B"H
// Detail view lets one spark speak closely.
import { describe } from "../state.js";
import { el, esc } from "./dom.js";
export function renderDetail(entry) {
  const d = describe(entry), hist = (entry.history || []).map(row => `<li><b>${esc(row.kind)}</b> · ${esc(row.text)}</li>`).join("");
  el("detailBody").innerHTML = `<p class="eyebrow">${esc(d.ritual.name)} · ${esc(entry.visibility)}</p><h2>${esc(entry.title)}</h2><p>${esc(entry.note || d.ritual.story)}</p><p class="meta">${esc(entry.type)} · ${esc(entry.status)} · ${esc(d.age)} · ${esc(d.due)}</p><div class="meter"><span style="width:${d.resonance}%"></span></div><span class="stage">${esc(d.life[0])}: ${esc(d.life[1])}</span>${hist ? `<h3>Memory rings</h3><ul class="history">${hist}</ul>` : ""}`;
}
