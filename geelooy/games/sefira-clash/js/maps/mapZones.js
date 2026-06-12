/**
 * B"H
 * Map zones.
 *
 * Chapter 58: platforms receive names of purpose: center to control, edge to
 * kill, safe to recover, landing to trap, danger to fear.
 */
export function buildMapZones(map, analysis, personality) {
  const centerX = analysis.center.x;
  const width = analysis.width;
  const zones = (map.platforms || []).map((p, id) => zoneFor(id, p, centerX, width, personality));
  return Object.freeze({
    zones,
    centerControl: zones.filter(z => z.kind === 'centerControl'),
    edgeKill: zones.filter(z => z.kind === 'edgeKill'),
    recoverySafe: zones.filter(z => z.recovery > 6),
    landingTrap: zones.filter(z => z.landing > 6),
    danger: zones.filter(z => z.danger > 6)
  });
}

function zoneFor(id, p, centerX, width, personality) {
  const cx = p.x + p.w / 2;
  const edgeN = Math.min(Math.abs(cx - centerX) / Math.max(1, width / 2), 1);
  const centerN = 1 - edgeN;
  const low = p.y > 420 ? 1 : 0;
  const high = p.y < -280 ? 1 : 0;
  const kind = edgeN > 0.62 ? 'edgeKill' : centerN > 0.55 ? 'centerControl' : high ? 'recoverySafe' : 'neutral';
  return Object.freeze({
    id, kind, x: cx, y: p.y, left: p.x, right: p.x + p.w,
    control: Math.round(centerN * 10), danger: Math.round(edgeN * personality.recoveryDifficulty),
    recovery: Math.round((high ? 7 : 3) + p.w / 260), landing: Math.round((p.w / 180) + centerN * 4 + low * 2),
    edge: Math.round(edgeN * 10)
  });
}
