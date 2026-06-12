/**
 * B"H
 * Offstage read.
 *
 * Chapter 224: near-ledge is not offstage. The bot should first push and kill
 * horizontally. Only when the target actually leaves the stage does edgeguard
 * become king.
 */
export function offstageRead(target, world) {
  const bounds = world.map?.bounds || { left: -1200, right: 1200, bottom: 900 };
  const offLeft = target.x < bounds.left + 90;
  const offRight = target.x > bounds.right - 90;
  const offBottom = target.y > bounds.bottom - 165;
  const offstage = offLeft || offRight || offBottom;
  const side = offLeft ? -1 : offRight ? 1 : Math.sign(target.x - center(bounds) || 1);
  if (!offstage && world.edgePressure?.active) return { state: 'nearLedge', side, offstage: false, low: false, high: false, inward: false };
  if (!offstage) return { state: 'onstage', side, offstage: false, low: false, high: false, inward: false };
  const low = target.y > bounds.bottom - 260;
  const high = target.y < bounds.bottom - 430;
  const inward = Math.sign(target.vx || 0) === -side;
  return { state: low ? 'offstageLow' : high ? 'offstageHigh' : inward ? 'recoveringInward' : 'offstageMid', side, offstage: true, low, high, inward };
}

function center(bounds) { return (bounds.left + bounds.right) / 2; }
