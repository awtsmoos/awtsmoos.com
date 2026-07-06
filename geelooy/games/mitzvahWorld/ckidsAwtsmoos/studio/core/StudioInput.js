// B"H
export function normalizePointerEvent(event) {
  const touch = event?.touches?.[0] || event?.changedTouches?.[0];
  return { x:Number(touch?.clientX ?? event?.clientX ?? 0), y:Number(touch?.clientY ?? event?.clientY ?? 0), pointerType:event?.pointerType || (touch ? "touch" : "mouse") };
}
export function keyboardShortcut(event) {
  const key = String(event?.key || "").toLowerCase();
  return { duplicate:(event?.metaKey || event?.ctrlKey) && key === "d", delete:key === "delete" || key === "backspace", save:(event?.metaKey || event?.ctrlKey) && key === "s" };
}
export default { normalizePointerEvent, keyboardShortcut };
