// B"H
export function createShopInventory(items = []) { return { buy:items, sell:true, prices:Object.fromEntries(items.map(item => [item.id, item.price || 1])) }; }
export default { createShopInventory };
