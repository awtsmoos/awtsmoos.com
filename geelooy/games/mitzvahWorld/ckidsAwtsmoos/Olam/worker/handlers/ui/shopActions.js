// B"H
/** @file shopActions.js @description Chapter 393: Buying and selling become one small interpreter. */
import { send } from './domKit.js';
import { changeBag, readBag } from './hudState.js';
import { clothing, shopRows } from './shopItemModel.js';
export function shopAction(host, index, act, render) {
  const data = host.__awtsData || {}, rows = shopRows(data, act === 'sell' ? 'sell' : 'buy'), item = rows.find(row => row.index === index);
  if (!item) return;
  if (act === 'buy') { if (readBag() < item.price) return alert('Not enough bag perutas.'); changeBag(-item.price, 'buy clothing'); send({ addItem: clothing(item) }); }
  if (act === 'sell') { changeBag(item.price, 'sell clothing'); send({ updateInventoryItem: { sourceType: 'inventory', index: item.index, itemData: { ...item, quantity: 0 } } }); data.playerInventory[item.index] = null; }
  render(host);
}
