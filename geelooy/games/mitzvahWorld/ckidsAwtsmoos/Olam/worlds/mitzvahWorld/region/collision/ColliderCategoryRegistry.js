// B"H
/** @file ColliderCategoryRegistry.js @description Explicit categories for every real solid in the starting zone. */
export const COLLIDER_CATEGORIES = Object.freeze({
  "cottage-wall":{ geometry:"box", visibleRequired:true, door:false },
  "closed-door":{ geometry:"box", visibleRequired:true, door:true },
  "tree-trunk":{ geometry:"cylinder", visibleRequired:true },
  "cliff-blocker":{ geometry:"box", visibleRequired:true },
  rock:{ geometry:"box", visibleRequired:true },
  "fence-post":{ geometry:"box", visibleRequired:true },
  "fence-rail":{ geometry:"box", visibleRequired:true },
  well:{ geometry:"cylinder", visibleRequired:true }
});
export function categorySpec(category) { return COLLIDER_CATEGORIES[category] || { geometry:"box", visibleRequired:true, unknown:true }; }
export function colliderCategoryStats(records = []) { const byCategory = {}; for (const r of records) byCategory[r.category || "unknown"] = (byCategory[r.category || "unknown"] || 0) + 1; return { categories:Object.keys(byCategory).length, byCategory }; }
export default COLLIDER_CATEGORIES;
