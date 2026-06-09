// B"H
/**
 * @file performanceTagger.js
 * @description Chapter 518: Small names become render groups. The Awtsmoos
 * reads IDs and assigns culling/instancing hints to tiny repeated props.
 */
const GROUPS = [
  [/road_.*_edge_|plaza_.*cobble|entry_path_center_cobble/, 'stone_repeat', 180],
  [/etz_firefly|_lantern_|_glass|_halo|_spark/, 'glow_repeat', 90],
  [/district_accent|_banner|_laundry_/, 'cloth_repeat', 240],
  [/market_.*produce|market_crate|market_barrel|market_sack/, 'market_repeat', 220],
  [/ambient_crowd_marker/, 'crowd_repeat', 220],
  [/distant_|waterfall|cloud_band/, 'vista_repeat', 900]
];
export function performanceTagFor(id = '') {
  const found = GROUPS.find(([rx]) => rx.test(id));
  if (!found) return { renderGroup: 'emerald_unique', instanceKey: `unique_${id}`, cullRadius: 260, performanceClass: 'unique' };
  return { renderGroup: found[1], instanceKey: found[1], cullRadius: found[2], performanceClass: 'repeat' };
}
