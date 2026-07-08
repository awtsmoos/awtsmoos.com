// B"H
/**
 * Chapter 36: The Market Measured Need With Mercy.
 *
 * A marketplace is not a second wallet. Bare postbuild simulations may still
 * trade with bounded `coins`; any real `olam` buyer pays through the personal
 * perutah wallet and receives the item through the canonical bag event path.
 */
import { awardMoney, bindWalletOlam, moneyOf } from "../../../../systems/economy/wallet/PersonalPerutaWallet.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { addBagItem } from "../../../../systems/inventory/BagRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

const number = value => Number.isFinite(Number(value)) ? Number(value) : 0;
const count = value => Math.max(1, Math.floor(number(value) || 1));
const olamOf = (buyer, context = {}) => context.olam || buyer?.olam || null;
const hasWalletShape = buyer => buyer && (buyer.perutah !== undefined || buyer.personalPerutas !== undefined || buyer.currency !== undefined);

function addLegacyInventory(buyer, itemId, qty) {
  buyer.inventory ||= {};
  buyer.inventory[itemId] = number(buyer.inventory[itemId]) + qty;
}

function addCanonicalInventory(olam, itemId, qty) {
  return addBagItem(olam, { id:itemId, baseId:itemId, qty, amount:qty, stackable:true });
}

export class MarketplaceRuntime {
  constructor(prices = {}) {
    this.prices = prices;
  }

  quote(itemId, demand = 1) {
    const base = this.prices[itemId] || 1;
    return Math.max(1, Math.round(base * demand));
  }

  buy({ buyer, itemId, qty = 1, demand = 1, context = {}, olam = null } = {}) {
    if (!buyer || !itemId) return { ok:false, reason:"invalid-purchase", cost:0, itemId, qty:count(qty) };
    const amount = count(qty), cost = this.quote(itemId, demand) * amount;
    const world = olam || olamOf(buyer, context);

    if (world || hasWalletShape(buyer)) {
      const walletPlayer = bindWalletOlam(buyer, world);
      if (moneyOf(walletPlayer) < cost) return { ok:false, reason:"low_perutah", cost, itemId, qty:amount, perutah:moneyOf(walletPlayer) };
      awardMoney(walletPlayer, -cost, "marketplace purchase");
      const item = world ? addCanonicalInventory(world, itemId, amount) : (addLegacyInventory(buyer, itemId, amount), null);
      return { ok:true, cost, itemId, qty:amount, perutah:moneyOf(walletPlayer), item };
    }

    if (number(buyer.coins) < cost) return { ok:false, reason:"no-coins", cost, itemId, qty:amount };
    buyer.coins = number(buyer.coins) - cost;
    addLegacyInventory(buyer, itemId, amount);
    return { ok:true, cost, itemId, qty:amount, coins:buyer.coins };
  }
}

export default MarketplaceRuntime;
