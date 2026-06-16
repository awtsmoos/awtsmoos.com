// B"H
/** Visible interactables that make the first systems ask the player. */
export const LEVEL_ONE_INTERACTIVES = Object.freeze([
  { id: 'first_sefer_book', type: 'flower', position: [-14, 0, -29], props: { interaction: 'inventory_pickup', itemId: 'chumash_bereishis', ask: 'Pick up the Chumash?' } },
  { id: 'clothing_mirror_marker', type: 'holyPillar', position: [14, 0, -13], props: { h: 2.2, r: 0.12, count: 1, interaction: 'clothing_switch', clothingId: 'blue_bekeshe', ask: 'Try on the blue bekeshe?' } },
  { id: 'merchant_sell_marker', type: 'radiantGate', position: [21, 0, -19], props: { w: 2, h: 2.5, t: 0.18, interaction: 'merchant', merchantId: 'market_shliach', ask: 'Buy or sell at the market?' } },
  { id: 'torah_skill_marker', type: 'holyPillar', position: [-18, 0, -31], props: { h: 2.8, r: 0.14, count: 1, interaction: 'learn_skill', skillId: 'chumash_reader', ask: 'Learn the first Chumash skill?' } }
]);
