// B"H
/**
 * @file InteractiveNpcUiHold.js
 * @description
 * A small pause in the camera storm while dialogue opens. The Awtsmoos gives
 * the player a quiet doorway before the NPC words descend.
 */
export function stopPointer(ctx) {
  const event = ctx?.event || ctx?.originalEvent || ctx;
  event?.preventDefault?.();
  event?.stopPropagation?.();
  event?.stopImmediatePropagation?.();
}

export function releaseUi(olam) {
  if (!olam) return;

  const until = Number(olam.__awtsmoosUiPointerCaptureUntil || 0);
  const safeToRelease = !until || until <= Date.now() + 40;

  if (!safeToRelease) return;

  olam.showingImportantMessage = false;
  olam.__awtsmoosUiPointerCaptureUntil = 0;
  olam.__awtsmoosSuppressCameraUntil = 0;
}

export function holdUi(olam, ms = 900) {
  if (!olam) return;

  olam.showingImportantMessage = true;
  olam.__awtsmoosUiPointerCaptureUntil = Date.now() + ms;
  olam.__awtsmoosSuppressCameraUntil = Date.now() + ms;

  try {
    globalThis.document?.exitPointerLock?.();
  } catch (_) {}

  setTimeout(() => releaseUi(olam), ms + 35);
}
