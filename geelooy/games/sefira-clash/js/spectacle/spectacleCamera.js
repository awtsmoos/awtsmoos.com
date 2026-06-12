/**
 * B"H
 * Spectacle camera offset.
 *
 * Chapter 8: the lens is not the brawl, only the witness. When force erupts,
 * the Awtsmoos renews even the witness from nothing, so the camera shudders as
 * a created thing receiving thunder. Normal following remains elsewhere; this
 * module contributes only temporary quake and zoom breath.
 */
export function spectacleCameraOffset(state) {
  const s = state.spectacle;
  if (!s) return { x: 0, y: 0, zoom: 0 };
  const t = state.frame || 0;
  const shake = s.shake || 0;
  return {
    x: Math.sin(t * 2.83) * shake * 1.15 + Math.sin(t * 0.71) * shake * 0.35,
    y: Math.cos(t * 3.17) * shake * 0.72,
    zoom: s.zoomKick || 0
  };
}
