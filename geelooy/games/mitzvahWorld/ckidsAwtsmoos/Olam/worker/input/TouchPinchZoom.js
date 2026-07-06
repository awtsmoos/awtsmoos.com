// B"H
/**
 * @file TouchPinchZoom.js
 * @description Two-finger camera zoom math for the primary mobile touch path.
 */
export const PINCH_ZOOM_SCALE = 8;

export function touchDistance(a, b) {
  if (!a || !b) return 0;
  return Math.hypot((a.pageX || 0) - (b.pageX || 0), (a.pageY || 0) - (b.pageY || 0));
}

export function pinchDeltaY(previousDistance, nextDistance) {
  if (!previousDistance || !nextDistance) return 0;
  return -(nextDistance - previousDistance) * PINCH_ZOOM_SCALE;
}

export function pinchPacket(previousDistance, firstTouch, secondTouch, seal) {
  const nextDistance = touchDistance(firstTouch, secondTouch);
  return {
    nextDistance,
    wheel:{
      deltaY:pinchDeltaY(previousDistance, nextDistance),
      source:"touch-orchestrator-pinch",
      multiTouch:true,
      seal
    }
  };
}
