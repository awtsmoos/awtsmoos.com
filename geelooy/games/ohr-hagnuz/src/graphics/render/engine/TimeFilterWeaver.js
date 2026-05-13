
import { StateRegister } from '../../../binah/StateRegister.js';

/**
 * B"H
 * @class TimeFilterWeaver
 * @chapter The Garments of Time
 * @description
 * "And God called the light Day, and the darkness He called Night."
 * Time itself is an entity created by the Awtsmoos. 
 * This class applies the highest overlay filter to the visual matrix,
 * simulating the contraction of light (Night) or the expansion of holiness (Shabbos).
 */
export class TimeFilterWeaver {
    /**
     * @description Casts the shadow or the glow over the final composed frame.
     * @param {CanvasRenderingContext2D} overCtx - The overlay vessel.
     * @param {number} W - Canvas width.
     * @param {number} H - Canvas height.
     */
    static apply(overCtx, W, H) {
        const time = StateRegister.TimeState.timeOfDay;
        const isShabbos = StateRegister.TimeState.isShabbos;
        const map = StateRegister.CurrentMapId;

        // In Atzilut, there is no time, no night, no filter. Only Pure Light.
        if (map.includes('Atzilut')) return;

        // Shabbos Golden Glow (Tosefet Shabbos - The Extra Soul)
        if (isShabbos) {
            overCtx.fillStyle = 'rgba(255, 213, 79, 0.15)';
            overCtx.globalCompositeOperation = 'overlay';
            overCtx.fillRect(0, 0, W, H);
            overCtx.globalCompositeOperation = 'source-over';
        }

        // Night time darkness (Tzimtzum)
        if (time === 'NIGHT' && !map.includes('Beriah')) {
            overCtx.fillStyle = 'rgba(0, 0, 20, 0.55)';
            overCtx.fillRect(0, 0, W, H);
            
            // Hero Lantern Aura (The Tzaddik reveals the hidden light in the darkness)
            const cx = W / 2; 
            const cy = H / 2;
            // The aura pulses dynamically with performance.now()
            const rad = 140 + (Math.sin(performance.now() * 0.005) * 15);
            
            let glow = overCtx.createRadialGradient(cx, cy, 0, cx, cy, rad);
            glow.addColorStop(0, 'rgba(255, 255, 220, 0.7)');
            glow.addColorStop(1, 'rgba(255, 255, 220, 0)');
            
            overCtx.globalCompositeOperation = 'screen';
            overCtx.fillStyle = glow;
            overCtx.beginPath(); 
            overCtx.arc(cx, cy, rad, 0, Math.PI * 2); 
            overCtx.fill();
            overCtx.globalCompositeOperation = 'source-over';
        }
    }
}
