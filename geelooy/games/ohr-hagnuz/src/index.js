import { HolyEngine } from './atzmus/HolyEngine.js';

/**
 * B"H
 * @file index.js
 * Starts the world whether this module loads before or after DOMContentLoaded.
 */
const ignite = () => {
  if (window.__OHR_HAGNUZ_IGNITED__) return;
  window.__OHR_HAGNUZ_IGNITED__ = true;
  console.log('B"H - The Spark of Creation has ignited.');
  HolyEngine.ignite();
};

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', ignite, { once: true });
} else {
  ignite();
}
