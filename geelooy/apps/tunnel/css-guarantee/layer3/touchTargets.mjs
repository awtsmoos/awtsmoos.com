//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Layer 12 (Touch Targets) of the Airtight CSS Guarantee System.
 * @description Verifies that every tappable element meets the minimum
 * touch-target size (WCAG 2.5.8 / platform convention: 44×44 CSS px).
 * Undersized targets on the 375×667 iOS and 360×640 Android viewports
 * from the Layer 8 device matrix are the usual offenders.
 *
 * Input shape: the probe harness measures rendered boxes on the live
 * page and emits one entry per element: { selector, width, height }
 * in CSS pixels. This module defines the interface and the check.
 */

/**
 * Minimum touch-target dimension in CSS pixels (both width and height).
 * @type {number}
 */
export const MIN_TOUCH_PX = 44;

/**
 * Checks rendered element boxes against the minimum touch-target size.
 *
 * @param {Array<{selector: string, width: number, height: number}>} elements
 *   One entry per measured element, in CSS pixels.
 * @returns {Array<{selector: string, width: number, height: number, issue: 'too small'}>}
 *   One finding per element whose width OR height is below MIN_TOUCH_PX.
 *   The returned array also carries `totalChecked` (elements measured) so
 *   formatTouchReport can render totals from the findings array alone.
 */
export function checkTouchTargets(elements) {
  const findings = [];
  let totalChecked = 0;
  for (const el of elements || []) {
    if (!el || typeof el !== 'object') continue;
    totalChecked++;
    const width = Number(el.width);
    const height = Number(el.height);
    if (width < MIN_TOUCH_PX || height < MIN_TOUCH_PX) {
      findings.push({
        selector: String(el.selector),
        width,
        height,
        issue: 'too small',
      });
    }
  }
  findings.totalChecked = totalChecked;
  return findings;
}

/**
 * Renders a human-readable summary of a touch-target check.
 *
 * @param {Array<{selector: string, width: number, height: number, issue: string}>} findings
 *   As returned by checkTouchTargets (uses its attached totalChecked
 *   when present).
 * @returns {string} e.g. "12 touch targets checked, 11 pass, 1 too small
 *   (minimum 44×44px): .btn-menu (30×30)".
 */
export function formatTouchReport(findings) {
  const list = Array.isArray(findings) ? findings : [];
  const total =
    typeof list.totalChecked === 'number' ? list.totalChecked : list.length;
  const bad = list.length;
  const good = Math.max(0, total - bad);
  if (bad === 0) {
    return `${total} touch targets checked, all meet the ${MIN_TOUCH_PX}px minimum.`;
  }
  const detail = list
    .map((f) => `${f.selector} (${f.width}×${f.height})`)
    .join(', ');
  return `${total} touch targets checked, ${good} pass, ${bad} too small (minimum ${MIN_TOUCH_PX}×${MIN_TOUCH_PX}px): ${detail}`;
}
