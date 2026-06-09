// B"H
/** @file shopRenderer.js @description Chapter 395: Rendering shops is separate from opening them. */
import { readBag } from './hudState.js';
import { shopRows } from './shopItemModel.js';
import { bindShop } from './shopBindings.js';
import { shopMarkup } from './shopMarkup.js';
export function renderShop(host, manager) {
  const data = host.__awtsData || {}, mode = host.dataset.mode || 'buy';
  host.innerHTML = shopMarkup(data, mode, shopRows(data, mode), readBag());
  bindShop(host, manager, nextHost => renderShop(nextHost, manager));
}
