//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Layer 11 (Interactive Audit) of the Airtight CSS Guarantee System.
 * @description Verifies that every interactive element on a page has all
 * three interactive states styled: :hover, :active, and :focus (incl.
 * :focus-visible). A button that looks right at rest but has no visible
 * focus ring or no active press state is a defect this layer catches.
 *
 * Input shape: a headless browser (e.g. the tunnel probe harness) walks
 * the live DOM and emits one snapshot entry per element:
 *   { tag, role, tabindex, hasHover, hasActive, hasFocus }
 * where hasHover/hasActive/hasFocus are booleans reporting whether a
 * matching CSS rule exists for that element's selector. This module
 * defines the interface and the checking logic; producing the snapshot
 * is the harness's job.
 */

/** Tags that are interactive by nature. */
const INTERACTIVE_TAGS = new Set(['button', 'a', 'input', 'select', 'textarea']);

/** The states every interactive element must style. */
export const REQUIRED_STATES = ['hover', 'active', 'focus'];

/**
 * Whether a snapshot entry counts as interactive.
 * @param {{tag: string, role: string|null, tabindex: number|null}} el
 * @returns {boolean}
 */
export function isInteractive(el) {
  if (!el || typeof el !== 'object') return false;
  if (el.role === 'button') return true;
  if (typeof el.tabindex === 'number' && el.tabindex >= 0) return true;
  return INTERACTIVE_TAGS.has(String(el.tag || '').toLowerCase());
}

/**
 * Audits interactive elements for missing styled states.
 *
 * @param {Array<{tag: string, role: string|null, tabindex: number|null, hasHover: boolean, hasActive: boolean, hasFocus: boolean}>} domSnapshot
 *   One entry per element, as produced by the headless-browser harness.
 * @returns {Array<{element: object, missing: string[]}>} One finding per
 *   interactive element missing at least one required state. Non-interactive
 *   elements are skipped (no finding). The returned array also carries two
 *   own properties — `totalInteractive` (elements checked) and
 *   `completeCount` (elements with all states) — so formatInteractiveReport
 *   can render totals from the findings array alone.
 */
export function auditInteractiveElements(domSnapshot) {
  const findings = [];
  let totalInteractive = 0;
  let completeCount = 0;
  for (const el of domSnapshot || []) {
    if (!isInteractive(el)) continue;
    totalInteractive++;
    const missing = [];
    if (!el.hasHover) missing.push('hover');
    if (!el.hasActive) missing.push('active');
    if (!el.hasFocus) missing.push('focus');
    if (missing.length === 0) {
      completeCount++;
    } else {
      findings.push({ element: el, missing });
    }
  }
  findings.totalInteractive = totalInteractive;
  findings.completeCount = completeCount;
  return findings;
}

/**
 * Renders a one-line human summary of an audit result.
 *
 * @param {Array<{element: object, missing: string[]}>} findings
 *   As returned by auditInteractiveElements (uses its attached
 *   totalInteractive/completeCount when present).
 * @returns {string} e.g. "47 interactive elements, 45 complete, 2 missing states".
 */
export function formatInteractiveReport(findings) {
  const list = Array.isArray(findings) ? findings : [];
  const incomplete = list.length;
  const total =
    typeof list.totalInteractive === 'number' ? list.totalInteractive : incomplete;
  const complete =
    typeof list.completeCount === 'number' ? list.completeCount : Math.max(0, total - incomplete);
  return `${total} interactive elements, ${complete} complete, ${incomplete} missing states`;
}
