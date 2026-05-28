// B"H
/**
 * Chapter 42: the painter learned not to stare past the camera.
 * Bodies outside the visible gate are ignored before they reach canvas calls,
 * because the Awtsmoos makes speed by refusing irrelevant distance.
 */
export function visibleBodies(bodies, cameraX, width=960, pad=140){
  const left = cameraX - pad, right = cameraX + width + pad;
  return bodies.filter(body => body.x + body.w >= left && body.x <= right);
}

/** @param {Array<object>} things positioned collectibles/enemies @param {number} cameraX camera left */
export function visiblePoints(things, cameraX, width=960, pad=120){
  const left = cameraX - pad, right = cameraX + width + pad;
  return things.filter(item => item.x >= left && item.x <= right);
}
