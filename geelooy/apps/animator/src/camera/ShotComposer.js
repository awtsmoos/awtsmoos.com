// B"H
import { AutomaticShotPlanner } from './planning/AutomaticShotPlanner.js';
export class ShotComposer { static target(state, event = {}) { return AutomaticShotPlanner.plan({ autoShot: true, ...event }, state); } }
