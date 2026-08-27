// B"H

import { onBeautyEvent } from "./events.js";

/**
 * B"H
 * Chapter 412: The Accent Learned To Change With The Weather.
 */
export function mountDynamicAccent() {
  const refresh = () => {
    const good = document.querySelector('.awt-health-chip[data-state="good"]');
    const warn = document.querySelector('.awt-health-chip[data-state="warn"]');
    document.body.classList.toggle("awt-accent-good", !!good && !warn);
    document.body.classList.toggle("awt-accent-warn", !!warn);
  };
  onBeautyEvent(refresh);
  setInterval(refresh, 2500);
  refresh();
}
