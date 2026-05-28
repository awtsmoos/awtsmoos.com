// B"H
/**
 * The Shefa market is a ladder made from temptation.
 *
 * The Awtsmoos lets cheap garments remain symbolic rectangles, while very
 * expensive upgrades unlock a more human 2D vessel: animated feet, swinging
 * arms, face, and yarmulke. It is pure appearance, never pay-to-win.
 */
export const MARKET_SKINS = Object.freeze([
  { id: 'plain', slot: 'robe', name: 'Traveler White', cost: 0, body: '#f8f0ff', trim: '#ffe28a', kippah: '#1a0b2d', note: 'simple kippah, honest light' },
  { id: 'ember', slot: 'robe', name: 'Klipah Ember Cloak', cost: 35, body: '#ffb86b', trim: '#ff6ad5', kippah: '#3b0618', note: 'hot robe for spike courts' },
  { id: 'ohr', slot: 'robe', name: 'Ohr HaGanuz Robe', cost: 80, body: '#d7fffb', trim: '#ffd36a', kippah: '#0f3c52', note: 'hidden light, cyan crown' },
  { id: 'gevurah', slot: 'robe', name: 'Gevurah Iron Skin', cost: 120, body: '#b9b1c8', trim: '#ff2f6d', kippah: '#20202a', note: 'steel judgment robe' },
  { id: 'malach', slot: 'hat', name: 'Malach Chrome Kippah', cost: 180, body: '#ffffff', trim: '#9df7ff', kippah: '#ffd36a', note: 'angel-bright gold cap' },
  { id: 'thorn', slot: 'hat', name: 'Thorn Crown', cost: 260, body: '#ffe6f5', trim: '#ff2f6d', kippah: '#38101c', note: 'spike king halo' },
  { id: 'void', slot: 'hat', name: 'Void Fisher Hat', cost: 340, body: '#c9d8ff', trim: '#7a7fff', kippah: '#050510', note: 'deep sky wandering brim' },
  { id: 'sawglass', slot: 'mask', name: 'Sawglass Visor', cost: 420, realistic: true, body: '#edf7ff', trim: '#9df7ff', kippah: '#7f183b', sleeve: '#9df7ff', leg: '#1c1830', face: '#f0c7a2', note: 'premium animated person with visor' },
  { id: 'copper', slot: 'robe', name: 'Copper Beggar Coat', cost: 520, realistic: true, body: '#c98345', trim: '#fff0cf', kippah: '#40210d', sleeve: '#d99a63', leg: '#2a160b', face: '#e7b184', note: 'premium walking coat stitched from perutahs' },
  { id: 'king', slot: 'hat', name: 'Maneh Crown', cost: 800, realistic: true, body: '#ffffff', trim: '#ff6ad5', kippah: '#ffd36a', sleeve: '#ffd36a', leg: '#26172e', face: '#f3c49b', note: 'premium royal person animation' }
]);

export const COIN_BREAKDOWN = Object.freeze([
  { key: 'perutah', label: 'Perutah', short: 'P', worth: 1, note: 'tiny copper spark used for survival crumbs' },
  { key: 'dinar', label: 'Dinar', short: 'D', worth: 5, note: 'silver argument ring from harder chambers' },
  { key: 'sela', label: 'Sela', short: 'S', worth: 20, note: 'heavy gate coin often hidden in sky routes' },
  { key: 'maneh', label: 'Maneh', short: 'M', worth: 100, note: 'royal treasure guarded by cruelty' },
  { key: 'shefa', label: 'Shefa', short: 'ש', worth: 1, note: 'spendable ladder-light for the forbidden market' }
]);

export function levelUnlockCost(nextLevelNumber) { return Math.max(250, 220 + nextLevelNumber * nextLevelNumber * 45); }

export function buySkin(market, bag, id) {
  const skin = MARKET_SKINS.find(item => item.id === id);
  if (!skin) return { ok: false, message: 'That garment is not in this world.' };
  const owned = new Set(market.owned || ['plain']);
  if (owned.has(id)) return equipSkin(market, id);
  if ((bag.shefa || 0) < skin.cost) return { ok: false, message: `${skin.name} needs ${skin.cost} Shefa.` };
  bag.shefa -= skin.cost;
  owned.add(id);
  market.owned = [...owned];
  market.equipped = id;
  market.message = `${skin.name} purchased and equipped.`;
  return { ok: true, message: market.message, skin };
}

export function buyLevelUnlock(state, levelCount) {
  const next = Math.min(levelCount, Math.max(1, state.unlocked || 1) + 1);
  if ((state.unlocked || 1) >= levelCount) return { ok: false, message: 'Every chamber is already unlocked.' };
  const cost = levelUnlockCost(next);
  if ((state.currency?.shefa || 0) < cost) return { ok: false, message: `Forbidden gate ${next} costs ${cost} Shefa.` };
  state.currency.shefa -= cost;
  state.unlocked = next;
  state.market.message = `You bribed open chamber ${next} for ${cost} Shefa.`;
  return { ok: true, message: state.market.message, level: next, cost };
}

export function equipSkin(market, id) {
  const owned = new Set(market.owned || ['plain']);
  const skin = MARKET_SKINS.find(item => item.id === id);
  if (!skin || !owned.has(id)) return { ok: false, message: 'Locked garment.' };
  market.equipped = id;
  market.message = `${skin.name} equipped.`;
  return { ok: true, message: market.message, skin };
}

export function equippedSkin(market) { return MARKET_SKINS.find(skin => skin.id === market.equipped) || MARKET_SKINS[0]; }
export function walletRows(bag) { return COIN_BREAKDOWN.map(row => ({ ...row, count: bag[row.key] || 0, total: (bag[row.key] || 0) * row.worth })); }
export function marketHud(market, bag) {
  const next = MARKET_SKINS.find(s => !(market.owned || ['plain']).includes(s.id));
  return `Skin ${equippedSkin(market).name} · Next ${next ? `${next.name} ${next.cost}` : 'sold out'} · Shefa ${bag.shefa || 0}`;
}
