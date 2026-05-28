// B"H
/**
 * The Shefa shop sells style and emergency ascent.
 *
 * The Awtsmoos lets a garment become courage and a locked chamber become a
 * costly gate. Nothing here touches earthly money: every purchase uses only the
 * in-game Shefa gathered through cruel coins, false coins, and survival.
 */
export const MARKET_SKINS = Object.freeze([
  { id: 'plain', name: 'Traveler White', cost: 0, body: '#f8f0ff', trim: '#ffe28a', kippah: '#1a0b2d', note: 'simple kippah, honest light' },
  { id: 'ember', name: 'Klipah Ember Cloak', cost: 35, body: '#ffb86b', trim: '#ff6ad5', kippah: '#3b0618', note: 'hot robe for spike courts' },
  { id: 'ohr', name: 'Ohr HaGanuz Robe', cost: 80, body: '#d7fffb', trim: '#ffd36a', kippah: '#0f3c52', note: 'hidden light, cyan crown' },
  { id: 'gevurah', name: 'Gevurah Iron Skin', cost: 120, body: '#b9b1c8', trim: '#ff2f6d', kippah: '#20202a', note: 'steel judgment hat' },
  { id: 'malach', name: 'Malach Chrome Kippah', cost: 180, body: '#ffffff', trim: '#9df7ff', kippah: '#ffd36a', note: 'angel-bright gold cap' }
]);

export const COIN_BREAKDOWN = Object.freeze([
  { key: 'perutah', label: 'Perutah', short: 'P', worth: 1, note: 'tiny copper spark' },
  { key: 'dinar', label: 'Dinar', short: 'D', worth: 5, note: 'silver argument ring' },
  { key: 'sela', label: 'Sela', short: 'S', worth: 20, note: 'heavy gate coin' },
  { key: 'maneh', label: 'Maneh', short: 'M', worth: 100, note: 'royal crown weight' },
  { key: 'shefa', label: 'Shefa', short: 'ש', worth: 1, note: 'spendable shop light' }
]);

/**
 * Computes the very expensive price to buy a locked level.
 *
 * @param {number} nextLevelNumber one-based level number being unlocked.
 * @returns {number} required Shefa.
 */
export function levelUnlockCost(nextLevelNumber) {
  return Math.max(250, 180 + nextLevelNumber * nextLevelNumber * 35);
}

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
  if ((state.currency?.shefa || 0) < cost) return { ok: false, message: `Level ${next} costs ${cost} Shefa to unlock.` };
  state.currency.shefa -= cost;
  state.unlocked = next;
  state.market.message = `Level ${next} unlocked for ${cost} Shefa.`;
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

export function equippedSkin(market) {
  return MARKET_SKINS.find(skin => skin.id === market.equipped) || MARKET_SKINS[0];
}

export function walletRows(bag) {
  return COIN_BREAKDOWN.map(row => ({ ...row, count: bag[row.key] || 0 }));
}

export function marketHud(market, bag) {
  const next = MARKET_SKINS.find(s => !(market.owned || ['plain']).includes(s.id));
  return `Skin ${equippedSkin(market).name} · Next ${next ? `${next.name} ${next.cost}` : 'sold out'} · Shefa ${bag.shefa || 0}`;
}
