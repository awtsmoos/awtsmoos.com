// B"H

import { el, text } from "./dom.js";
import { onBeautyEvent, readTimeline } from "./events.js";

/**
 * B"H
 * Chapter 395: The Stream Became Cards Instead Of Noise.
 */
export function mountEventStream(root) {
  const list = el("div", { classes: ["awt-event-list"] });
  root.append(el("section", { classes: ["awt-event-stream"], children: [text("h3", "Live Event Stream"), list] }));
  const render = () => list.replaceChildren(...readTimeline().slice(0, 8).map(eventCard));
  onBeautyEvent(render);
  render();
}

function eventCard(entry) {
  return el("article", { classes: ["awt-event-card"], children: [
    text("strong", entry.label || entry.type),
    text("small", new Date(entry.time).toLocaleTimeString())
  ] });
}
