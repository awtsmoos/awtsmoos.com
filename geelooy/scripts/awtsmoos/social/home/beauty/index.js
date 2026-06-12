// B"H
/** Chapter 324: Home beauty runner. */
import { bindHomeAmbientPointer } from './ambientPointer.js';

export function runHomeBeauty() {
  const unbindPointer = bindHomeAmbientPointer();
  window.__awtsmoosHomeBeauty = { active: true, unbindPointer };
  return window.__awtsmoosHomeBeauty;
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', runHomeBeauty, { once: true });
else runHomeBeauty();
