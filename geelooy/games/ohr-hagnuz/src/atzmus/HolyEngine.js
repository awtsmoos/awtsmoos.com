
import { Speech } from '../malchus/Speech.js';
import { Wisdom } from '../chochmah/Wisdom.js';
import { Beauty } from '../tiferet/Beauty.js';
import { MenuEngine } from '../graphics/MenuEngine.js';

export class HolyEngine {
    static lastTime = 0;
    static breathe() {
        const loop = (timestamp) => {
            const dt = Math.min(timestamp - this.lastTime, 32);
            this.lastTime = timestamp;
            this.pulse(dt);
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }
    static pulse(dt) {
        Speech.clear();
        Wisdom.process(dt);
        const ctx = Speech.getPen();
        Beauty.reveal(ctx);
        MenuEngine.draw(ctx);
        Speech.drawUI();
    }
}
