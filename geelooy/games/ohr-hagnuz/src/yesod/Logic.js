
import { State } from '../binah/State.js';
import { WorldData } from '../data/WorldData.js';

/**
 * B"H
 * @class Logic
 * @chapter The Laws of Movement
 */
export class Logic {
    /**
     * @description Digests the intent buffer into hero kinetic arousal.
     */
    static process() {
        const H = State.Hero;
        const i = window.AwtsmoosIntents;

        if (!H.moving) {
            let dx = 0, dy = 0, dir = H.dir;

            if (i.U) { dy = -1; dir = 'u'; }
            else if (i.D) { dy = 1; dir = 'd'; }
            else if (i.L) { dx = -1; dir = 'l'; }
            else if (i.R) { dx = 1; dir = 'r'; }

            if (dx !== 0 || dy !== 0) {
                H.dir = dir;
                if (this._canPass(H.cx + dx, H.cy + dy)) {
                    H.moving = true;
                    H.cx += dx;
                    H.cy += dy;
                }
            }
        } else {
            const res = State.Resolution;
            const spd = State.Speed;

            if (H.dir === 'u') H.dy -= spd;
            if (H.dir === 'd') H.dy += spd;
            if (H.dir === 'l') H.dx -= spd;
            if (H.dir === 'r') H.dx += spd;

            H.stepTick += spd;

            if (H.stepTick >= res) {
                H.moving = false;
                H.stepTick = 0;
                H.dx = H.cx * res;
                H.dy = H.cy * res;
            }
        }
    }

    static _canPass(tx, ty) {
        if (tx < 0 || tx >= 25 || ty < 0 || ty >= 14) return false;
        const map = WorldData[State.MapId];
        const row = map[ty];
        const char = [...row][tx];
        return char !== 'T' && char !== 'W';
    }
}
