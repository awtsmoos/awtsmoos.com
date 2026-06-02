// B"H

/**
 * ViewportWindow keeps unseen bodies silent.
 *
 * Chapter 10: The Awtsmoos did not ask every distant stone to shout each
 * frame. Only the near world receives breath; far bodies wait outside the veil
 * until the camera approaches with mercy.
 */
export function viewportWindow(world, margin = 720) {
  const width = Number(world?.visibleViewportWidth || 960);
  const height = Number(world?.visibleViewportHeight || 540);
  return {
    left: Number(world?.visibleCameraX || 0) - margin,
    right: Number(world?.visibleCameraX || 0) + width + margin,
    top: Number(world?.visibleCameraY || 0) - margin,
    bottom: Number(world?.visibleCameraY || 0) + height + margin
  };
}

/** @param {object} item body/point @param {object} win viewport window @returns {boolean} */
export function nearWindow(item, win) {
  const x = Number(item?.x || 0), y = Number(item?.y || 0), w = Number(item?.w || 28), h = Number(item?.h || 28);
  return x + w >= win.left && x <= win.right && y + h >= win.top && y <= win.bottom;
}
