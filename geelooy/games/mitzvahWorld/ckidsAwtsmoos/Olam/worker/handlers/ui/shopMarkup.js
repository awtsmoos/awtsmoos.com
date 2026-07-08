// B"H
/**
 * @file shopMarkup.js
 * @description Chapter 392: The shop parchment is rendered from rows, wallet,
 * and NPC name.
 */
import { esc } from './domKit.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
export function shopMarkup(data, mode, rows, bag) {
  const list = rows.length ? rows.map(row => `<div class="awts-shop-row"><div class="awts-shop-icon">${esc(row.icon || '✦')}</div><div><h3>${esc(row.name || 'Item')}</h3><p>${esc(row.description || 'Colored clothing.')}</p><div class="awts-shop-price">${row.price} perutas</div></div><button type="button" data-shop-act="${row.type}" data-shop-index="${row.index}" class="awts-shop-btn awts-shop-warm">${row.type === 'buy' ? 'BUY' : 'SELL'}</button></div>`).join('') : `<div class="awts-muted">Nothing here yet.</div>`;
  return `<section class="awts-shop-card"><h2 class="awts-shop-title">${esc(data.npcName || data.fromNpc || 'Guide')} Market</h2><div class="awts-shop-wallet">Bag: ${bag} perutas</div><div class="awts-shop-tabs"><button type="button" data-shop-tab="buy" class="awts-shop-btn ${mode === 'buy' ? 'awts-primary' : 'awts-shop-warm'}">BUY</button><button type="button" data-shop-tab="sell" class="awts-shop-btn ${mode === 'sell' ? 'awts-primary' : 'awts-shop-warm'}">SELL</button></div><div class="awts-shop-list">${list}</div><div class="awts-npc-actions"><button type="button" data-shop-close class="awts-npc-btn awts-close">CLOSE</button><button type="button" data-shop-back class="awts-npc-btn awts-primary">BACK</button></div></section>`;
}
