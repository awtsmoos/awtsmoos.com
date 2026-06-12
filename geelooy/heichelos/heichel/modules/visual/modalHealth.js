// B"H
/**
 * Chapter 314: Modal health reads the real registry, not imagined attributes.
 * The Scribe registers refs in DOMElements; it does not stamp data-ref on DOM.
 * This health check therefore follows the real vessel path and only warns.
 */

import { DOMElements } from '../dom.js';

export function reportModalHealth() {
  const required = ['modalRoot', 'modalForm', 'modalBackdrop', 'modalTitleInput'];
  const optional = ['modalCancelBtn', 'modalContentTypeSelect', 'modalDescTextarea', 'modalIdInput'];
  const report = { required: {}, optional: {} };
  required.forEach(name => { report.required[name] = Boolean(DOMElements[name]); });
  optional.forEach(name => { report.optional[name] = Boolean(DOMElements[name]); });
  report.ok = Object.values(report.required).every(Boolean);
  window.__awtsmoosModalHealth = report;
  if (!report.ok) console.warn('B"H modal health warning', report);
  return report;
}
