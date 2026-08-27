// B"H

import { el } from "./dom.js";
import { onBeautyEvent } from "./events.js";

/**
 * B"H
 * Chapter 394: The Pulse Remembered Every Footstep.
 */
export function mountActivityPulse(root) {
  const bars = Array.from({ length: 14 }, (_, i) => el("i", { attrs: { style: `--h:${20 + (i % 5) * 10}%` } }));
  const wrap = el("section", { classes: ["awt-activity-pulse"], children: bars });
  root.append(wrap);
  onBeautyEvent(() => animate(bars));
  setInterval(() => animate(bars), 3500);
}

function animate(bars) {
  bars.forEach((bar, index) => {
    const h = 18 + ((Date.now() / 97 + index * 17) % 70);
    bar.style.setProperty("--h", `${h}%`);
  });
}
