// B"H
/** @file ShopUiState.js @description Beautiful shop state: tabs, wallet, compare, preview, buy/sell readiness. */
import { merchantProfile, merchantItems } from "../runtime/MerchantInventoryRuntime.js";
import { buyPrice, sellPrice } from "../runtime/PerutaPricingRuntime.js";
export function shopUiState({ actorId="player", merchantId="blacksmith", wallet, buySell, selectedId=null }={}){
  const merchant=merchantProfile(merchantId), items=merchantItems(merchantId).map(item=>({ ...item, buyPrice:buyPrice(item,merchant), sellPrice:sellPrice(item,merchant), selected:item.id===selectedId }));
  const selected=items.find(x=>x.id===selectedId)||items[0]||null;
  return { actorId, merchant, tabs:merchant.categories, wallet:wallet?.snapshot?.(actorId), playerInventory:buySell?.snapshot?.(actorId)?.inventory||[], items, selected, preview:{ rotate:true, compare:true, rarity:selected?.rarity||"common" }, actions:{ canBuy:Boolean(selected), canSell:Boolean(selected && buySell?.snapshot?.(actorId)?.inventory?.includes(selected.id)) } };
}
export default shopUiState;
