// B"H
/** Chapter 335: Home legend behavior awakens after beauty. */
import { bindFeedCardObserver } from './feedCardObserver.js';
import { bindConstellationState } from './constellationState.js';

export function runHomeLegend() {
  const unbindFeed = bindFeedCardObserver();
  const constellation = bindConstellationState();
  window.__awtsmoosHomeLegend = { active: true, unbindFeed, constellationCount: constellation.length };
  return window.__awtsmoosHomeLegend;
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', runHomeLegend, { once: true });
else runHomeLegend();
