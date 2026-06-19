// B"H
import { AutomaticShotPlanner } from '../planning/AutomaticShotPlanner.js';
export class ShotPlanner { static plan(name = 'establishingShot', state = null, event = {}) { return state ? AutomaticShotPlanner.plan({ shotType: name, autoShot: true, ...event }, state) : { shotType: name, x: 0, y: 128, zoom: name.includes('close') ? 1.4 : 0.82 }; } }
