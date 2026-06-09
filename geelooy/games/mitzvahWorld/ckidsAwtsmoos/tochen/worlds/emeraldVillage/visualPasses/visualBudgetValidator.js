// B"H
/**
 * @file visualBudgetValidator.js
 * @description Chapter 489: Beauty must fit each vessel. Mobile requires rich
 * enough detail; ultra-low is allowed to be lighter so older phones can breathe.
 */
export const EMERALD_VISUAL_LIMITS = Object.freeze({
  ultraLow: Object.freeze({ maxTrees: 120, maxDomem: 900, minDomem: 550, minVisualPasses: 10 }),
  mobile: Object.freeze({ maxTrees: 200, maxDomem: 1350, minDomem: 1000, minVisualPasses: 10 }),
  balanced: Object.freeze({ maxTrees: 700, maxDomem: 2200, minDomem: 1200, minVisualPasses: 10 }),
  desktop: Object.freeze({ maxTrees: 900, maxDomem: 2600, minDomem: 1200, minVisualPasses: 10 }),
  epic: Object.freeze({ maxTrees: 1300, maxDomem: 3200, minDomem: 1200, minVisualPasses: 10 })
});
const count = value => value && typeof value === 'object' ? Object.keys(value).length : 0;
const limitsFor = profile => EMERALD_VISUAL_LIMITS[profile?.visualDensity || profile?.profile] || EMERALD_VISUAL_LIMITS.mobile;
export function validateEmeraldVisualBudget(n, profile = {}) {
  const limits = limitsFor(profile);
  const result = { profile: profile.profile || 'mobile', density: profile.visualDensity || profile.profile || 'mobile', limits, trees: count(n.ProceduralTree), domem: count(n.Domem), passCount: Object.values(n.__visualEnrichment || {}).filter(Boolean).length, ok: true, failures: [] };
  if (result.trees > limits.maxTrees) result.failures.push(`trees ${result.trees} > ${limits.maxTrees}`);
  if (result.domem > limits.maxDomem) result.failures.push(`domem ${result.domem} > ${limits.maxDomem}`);
  if (result.domem < limits.minDomem) result.failures.push(`domem ${result.domem} < ${limits.minDomem}`);
  if (result.passCount < limits.minVisualPasses) result.failures.push(`passes ${result.passCount} < ${limits.minVisualPasses}`);
  result.ok = result.failures.length === 0;
  n.__visualBudget = result;
  return result;
}
