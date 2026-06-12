/**
 * B"H
 * Hyper-real visual animation vessel. It shapes only pose/readability, never gameplay authority.
 */
import {byPriority} from './posePriority.js';
export function applyInfluences(pose,influences=[]){for(const i of influences.flat().filter(Boolean).sort(byPriority)){const pt=pose[i.point];if(!pt)continue;const w=Number.isFinite(i.weight)?i.weight:1;pt.x+=(i.dx||0)*w;pt.y+=(i.dy||0)*w}return pose}
export function collectInfluences(...sets){return sets.flatMap(s=>Array.isArray(s)?s:s?.items||[])}
