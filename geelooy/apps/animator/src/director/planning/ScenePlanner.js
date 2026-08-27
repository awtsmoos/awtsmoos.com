// B"H
import { BeatPlanner } from './BeatPlanner.js'; import { CameraPlanner } from './CameraPlanner.js';
export class ScenePlanner { static plan() { const beats = BeatPlanner.healthyLunch(); return { beats, cameras: beats.map(b => CameraPlanner.forBeat(b)) }; } }
