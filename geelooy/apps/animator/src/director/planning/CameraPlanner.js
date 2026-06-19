// B"H
import { ShotPlanner } from '../../camera/production/ShotPlanner.js';
export class CameraPlanner { static forBeat(beat) { return ShotPlanner.plan(String(beat).includes('plate') ? 'table' : 'establish'); } }
