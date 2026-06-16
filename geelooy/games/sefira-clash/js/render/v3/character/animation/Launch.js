/** B"H — launch gateway: normal flight, wall refusal, ground thunder. */
import { clamp } from './Math.js';
import { baseLaunch } from './launch/BaseLaunch.js';
import { wallBounce } from './launch/WallBounce.js';
import { groundBounce } from './launch/GroundBounce.js';

export function launch(p, f, info = {}) {
  const x = Math.sign(f.vx || p.face || 1);
  const y = clamp((f.vy || -8) / 14, -1, 1);
  if (info.name === 'wallBounce') return wallBounce(p, f, x);
  if (info.name === 'groundBounce') return groundBounce(p, f, x);
  return baseLaunch(p, x, y);
}
