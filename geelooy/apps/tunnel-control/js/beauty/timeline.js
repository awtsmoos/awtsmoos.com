// B"H

import { el, text } from "./dom.js";
import { readTimeline, onBeautyEvent } from "./events.js";

/**
 * B"H
 * Chapter 396: The Session Timeline Became A Scroll Of Sparks.
 */
export function mountTimeline(root) {
  const list = el("div", { classes: ["awt-timeline-list"] });
  root.append(el("section", { classes: ["awt-session-timeline"], children: [text("h3", "Session Timeline"), list] }));
  const render = () => list.replaceChildren(...readTimeline().slice(0, 12).map(row));
  onBeautyEvent(render);
  render();
}

function row(entry) {
  return el("div", { classes: ["awt-timeline-row"], children: [
    text("span", new Date(entry.time).toLocaleTimeString()),
    text("strong", entry.label || entry.type)
  ] });
}
