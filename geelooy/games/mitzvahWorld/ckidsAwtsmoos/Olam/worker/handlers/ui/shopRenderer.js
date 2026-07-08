// B"H
/** @file shopRenderer.js @description Chapter 395: Rendering shops is separate from opening them. */
import { readBag } from './hudState.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { shopRows } from './shopItemModel.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { bindShop } from './shopBindings.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { shopMarkup } from './shopMarkup.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
export function renderShop(host, manager) {
  const data = host.__awtsData || {}, mode = host.dataset.mode || 'buy';
  host.innerHTML = shopMarkup(data, mode, shopRows(data, mode), readBag());
  bindShop(host, manager, nextHost => renderShop(nextHost, manager));
}
