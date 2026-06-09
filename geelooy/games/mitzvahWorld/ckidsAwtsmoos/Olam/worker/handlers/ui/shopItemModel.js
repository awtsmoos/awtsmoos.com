// B"H
/** @file shopItemModel.js @description Chapter 391: Shop items are normalized before trade. */
export const clothing = (item = {}) => ({ className: 'Apparel', quantity: 1, stackSize: 1, sellValue: item.sellValue || Math.max(1, Math.floor((item.price || 2) / 2)), ...item, isTintable: true });
export function shopRows(data, mode) {
  const buy = data.shopInventory || data.items || [], sell = data.playerInventory || [];
  return mode === 'sell' ? sell.map((item, index) => item && { ...item, index, type: 'sell', price: item.sellValue || 1 }).filter(Boolean) : buy.map((item, index) => ({ ...item, index, type: 'buy', price: item.price || item.sellValue || 1 }));
}
