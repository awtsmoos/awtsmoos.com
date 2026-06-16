// B"H
/** @file ColliderClassifier.js @description Classify visible-sourced blockers and visual-only abundance, parser-clear. */
function list(value) { return Array.isArray(value) ? value : []; }
function count(value) { return Array.isArray(value) ? value.length : Number(value && value.count ? value.count : 0); }
function houseHardCollider(house) { return { type:"house", id:house.id, x:house.x, z:house.z, w:house.sx || 8, d:house.sz || 6, h:house.sy || 4.2, visibleTwin:true }; }
export function classifyRegionColliders({ houses = [], roads = {}, instances = {} } = {}) {
  const hard = list(houses).map(houseHardCollider);
  const soft = [{ type:"tree-trunks", count:count(instances.trees) }, { type:"large-rocks", count:Math.floor(count(instances.rocks) * .08) }];
  const visual = ["grass", "flowers", "moss", "smallRocks", "cloth", "vegetables", "roadSurfaces"];
  return { hard, soft, visual, roads:Boolean(roads), policy:"visible-sourced-hard-only-ground-first" };
}
