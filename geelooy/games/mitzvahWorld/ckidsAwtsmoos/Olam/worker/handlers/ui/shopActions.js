// B"H
/** @file shopActions.js @description Buying and selling without blocking alerts. */
import { send } from './domKit.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { changeBag, readBag } from './hudState.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { clothing, shopRows } from './shopItemModel.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
function notice(text) { console.warn('B"H | SHOP_NOTICE', { text }); send({ uiEvent:{ shaym:"effectsOverlay", data:{ text, color:"#ffd95a" } } }); }
export function shopAction(host, index, act, render) {
  const data = host.__awtsData || {}, rows = shopRows(data, act === 'sell' ? 'sell' : 'buy'), item = rows.find(row => row.index === index);
  if (!item) return;
  if (act === 'buy') { if (readBag() < item.price) return notice('Not enough bag perutas.'); changeBag(-item.price, 'buy clothing'); send({ addItem: clothing(item) }); }
  if (act === 'sell') { changeBag(item.price, 'sell clothing'); send({ updateInventoryItem:{ sourceType:'inventory', index:item.index, itemData:{ ...item, quantity:0 } } }); data.playerInventory[item.index] = null; }
  render(host);
}
