// B"H
// Constellations are communal memory without vanity.
import { constellations } from "../state.js";
import { el, esc } from "./dom.js";
export function renderConstellations(entries) {
  el("constellations").innerHTML = constellations(entries).map(card).join("") || "<p class='meta'>Repeat a path twice and a constellation quietly appears.</p>";
}
function card(c) {
  const fruit = c.rows.filter(e => e.status === "Fulfilled").length;
  return `<article class="constellation"><b>${esc(c.type)} constellation</b><p class="meta">${c.rows.length} sparks · ${fruit} fruit · no ranking, only memory</p><div class="meter"><span style="width:${Math.min(100, c.rows.length * 18)}%"></span></div></article>`;
}
