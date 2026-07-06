// B"H
export function createShopkeeperState(shopId = "shop") { return { role:"shopkeeper", shopState:{ shopId, openOnInteract:true } }; }
export default { createShopkeeperState };
