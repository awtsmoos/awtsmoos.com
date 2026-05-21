/**
 * B"H
 * Chapter 36: The Market Measured Need With Mercy.
 */

export class MarketplaceRuntime {
  constructor(prices = {}) {
    this.prices = prices;
  }

  quote(itemId, demand = 1) {
    const base = this.prices[itemId] || 1;
    return Math.max(1, Math.round(base * demand));
  }

  buy({ buyer, itemId, qty = 1, demand = 1 }) {
    const cost = this.quote(itemId, demand) * qty;
    if ((buyer.coins || 0) < cost) return { ok: false, reason: 'no-coins', cost };
    buyer.coins -= cost;
    buyer.inventory[itemId] = (buyer.inventory[itemId] || 0) + qty;
    return { ok: true, cost, itemId, qty };
  }
}

export default MarketplaceRuntime;
