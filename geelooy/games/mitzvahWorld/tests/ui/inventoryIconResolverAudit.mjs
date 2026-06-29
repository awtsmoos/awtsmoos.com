// B"H
import assert from "node:assert/strict";
import { InventoryItemIndex } from "../../ckidsAwtsmoos/systems/inventory/InventoryItemIndex.js";
import { resolveItemIcon } from "../../ckidsAwtsmoos/systems/inventory/ItemIconResolver.js";

const placeholder = /^[A-Z0-9_? -]{2,16}$/;
const rows = Object.values(InventoryItemIndex);
assert(rows.length > 20, "item index should cover the MMO starter inventory");

for (const item of rows) {
  const icon = resolveItemIcon(item);
  assert.equal(typeof icon, "string", `${item.id} must resolve an icon`);
  assert(icon.length > 0, `${item.id} icon must not be empty`);
  assert(!placeholder.test(icon), `${item.id} must not expose placeholder token ${icon}`);
}

console.log("B\"H inventory icon resolver audit passed.", { items: rows.length });
