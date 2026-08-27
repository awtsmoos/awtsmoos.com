// B"H
/** Keyboard sending bends to the device, not against it. */
export function maybeSendFromKeyboard(event, sendFromText) {
  if (event.key !== "Enter") return;
  const mobile = isCoarsePointer() || isMobileUserAgent();
  const send = event.ctrlKey || event.metaKey || (!mobile && !event.shiftKey && !event.altKey);
  if (!send) return;
  event.preventDefault();
  sendFromText();
}

function isCoarsePointer() {
  try { return matchMedia?.("(pointer: coarse)")?.matches; }
  catch (_error) { return false; }
}

function isMobileUserAgent() {
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || "");
}
