// B"H
/** @file CollectToastUI.js @description Pure view-model for collect/pickup payloads. */
export function collectToastView(payload = {}) {
  const item = payload.item || payload;
  return { type:"CollectToastUI", itemId:item?.id || null, name:item?.name || item?.id || "Item", category:item?.category || "Materials", amount:Number(payload.amount || item?.quantity || 1), icon:item?.icon || "✦" };
}
export default { collectToastView };
