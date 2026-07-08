// B"H
/** @file AncientJewishUiRuntimePolicy.js @description WoW-grade shlichus UI skin law with cheap panels and ancient Jewish atmosphere. */
import { masterRealismPolicy } from '../realism/MasterRealismPolicy.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11';
export function ancientJewishUiRuntimePolicy(budget = globalThis.__MITZVAH_WORLD_PERFORMANCE_BUDGET__) {
  const p = masterRealismPolicy(budget).ui;
  return {
    ...p,
    palette: ['parchment', 'ink', 'candle-gold', 'brass', 'cedar-wood', 'old-map-blue'],
    panels: ['quest-tracker', 'inventory', 'skill-book', 'learning-log', 'dialogue', 'gossip', 'mission-log'],
    law: 'collapse-by-default-on-mobile, no-blocking-overlay-during-gameplay, max-panels-by-budget',
    animation: budget?.tier === 'survival' ? 'none' : 'opacity-transform-only',
    textureCost: 'css-gradients-and-small-atlas-not-large-dom-images'
  };
}
export default ancientJewishUiRuntimePolicy;
