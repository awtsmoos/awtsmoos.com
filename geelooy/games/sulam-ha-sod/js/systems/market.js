// B"H
/**
 * The Shefa shop sells style, never earthly money.
 *
 * The Awtsmoos lets a garment become courage: robes, hats, and glows change the
 * player vessel without changing hitboxes. Purchases use only in-game Shefa.
 */
export const MARKET_SKINS = Object.freeze([
  { id: 'plain', name: 'Traveler White', cost: 0, body: '#f8f0ff', trim: '#ffe28a', kippah: '#1a0b2d', note: 'simple kippah, honest light' },
  { id: 'ember', name: 'Klipah Ember Cloak', cost: 35, body: '#ffb86b', trim: '#ff6ad5', kippah: '#3b0618', note: 'hot robe for spike courts' },
  { id: 'ohr', name: 'Ohr HaGanuz Robe', cost: 80, body: '#d7fffb', trim: '#ffd36a', kippah: '#0f3c52', note: 'hidden light, cyan crown' },
  { id: 'gevurah', name: 'Gevurah Iron Skin', cost: 120, body: '#b9b1c8', trim: '#ff2f6d', kippah: '#20202a', note: 'steel judgment hat' },
  { id: 'malach', name: 'Malach Chrome Kippah', cost: 180, body: '#ffffff', trim: '#9df7ff', kippah: '#ffd36a', note: 'angel-bright gold cap' }
]);

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

export function marketHud(market, bag) {
  const next = MARKET_SKINS.find(s => !(market.owned || ['plain']).includes(s.id));
  return `Skin ${equippedSkin(market).name} · Next ${next ? `${next.name} ${next.cost}` : 'sold out'} · Shefa ${bag.shefa || 0}`;
}
