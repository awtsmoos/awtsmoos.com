// B"H
/** Camera movement as pure data: no THREE, no renderer, only intent. */
export function cameraRailFromShot(shot = {}) {
  return { railId:`rail:${shot.id || "shot"}`, mode:shot.type || "static", target:shot.target || null, points:[shot.from, shot.to].filter(Boolean), duration:shot.duration || 3, easing:shot.easing || "smoothstep" };
}
export function cameraRailsFromTimeline(timeline = []) { return timeline.map(cameraRailFromShot); }
