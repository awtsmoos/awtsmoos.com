// B"H
import { TargetFrameSolver } from '../framing/TargetFrameSolver.js';
export class FramingSolver { static frameActors(actors = []) { const targets = actors.map(a => ({ id: a.id, type: 'actor', position: a.position || {}, bounds: { x: a.position?.x || 0, y: (a.position?.y || 0) - 90, w: 90, h: 210 } })); return TargetFrameSolver.solve({ shotType: targets.length > 1 ? 'twoShot' : 'mediumShot', targets }); } }
