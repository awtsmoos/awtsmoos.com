// B"H
/**
 * @file MouseInteractionPayload.js
 * @description
 * Pointer intention normalization. The Awtsmoos keeps left click, right click,
 * context menu, and touch separate all the way into the Nivra.
 */
export function metaFrom(payload = {}) {
  const event = payload.event || payload.originalEvent || payload;
  const type = String(payload.type || event?.type || "").toLowerCase();
  const pointerType = String(
    payload.pointerType || event?.pointerType || (type.includes("touch") ? "touch" : "mouse")
  ).toLowerCase();
  const rawButton = payload.button ?? event?.button;
  const button = Number.isFinite(Number(rawButton)) ? Number(rawButton) : 0;
  const isTouch = pointerType === "touch"
    || Boolean(payload.touches || payload.changedTouches)
    || type.includes("touch");

  return {
    button,
    buttons: Number(payload.buttons ?? event?.buttons ?? 0),
    pointerType,
    isTouch,
    contextMenu: type === "contextmenu" || payload.contextMenu === true || button === 2,
    originalType: type || "click"
  };
}

export function interactionPayload(payload, hit) {
  const meta = metaFrom(payload);
  return {
    type: meta.isTouch ? "touchend" : meta.contextMenu ? "contextmenu" : "click",
    explicit: true,
    isPointer: true,
    isTap: meta.isTouch,
    isTouch: meta.isTouch,
    pointerType: meta.pointerType,
    button: meta.button,
    buttons: meta.buttons,
    contextMenu: meta.contextMenu,
    clientX: Number(payload.clientX),
    clientY: Number(payload.clientY),
    hitObjectName: hit?.object?.name,
    event: payload.event || payload.originalEvent || null
  };
}

export function stopBrowserContext(payload = {}) {
  const event = payload.event || payload.originalEvent || payload;
  event?.preventDefault?.();
  if (metaFrom(payload).contextMenu) event?.stopPropagation?.();
}
