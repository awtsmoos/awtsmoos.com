
import { StateRegister } from '../../../binah/StateRegister.js';

/**
 * B"H
 * @class SkyGradientWeaver
 * @chapter The Stretching of the Firmament
 * @description
 * "He stretches out the heavens like a curtain..." (Psalms 104:2).
 * The sky is not empty space; it is a canvas of Divine Light filtered through 
 * the constraints of time (Seder HaZman) and space (The Four Worlds).
 * This class weaves the exact gradient of the firmament every single frame, 
 * refreshing its existence from nothingness.
 */
export class SkyGradientWeaver {
    /**
     * @description Materializes the celestial dome onto the background canvas.
     * @param {CanvasRenderingContext2D} bgCtx - The lowest vessel of projection.
     * @param {number} W - Canvas width.
     * @param {number} H - Canvas height.
     * @param {boolean} isHouse - Are we indoors?
     */
    static apply(bgCtx, W, H, isHouse) {
        if (isHouse) {
            bgCtx.fillStyle = '#2d1e16'; // The dark wood of the interior
            bgCtx.fillRect(0, 0, W, H);
            return;
        }

        const time = StateRegister.TimeState.timeOfDay;
        const map = StateRegister.CurrentMapId;
        
        let grad = bgCtx.createLinearGradient(0, 0, 0, H);
        
        // Atzilut and Beriah possess their own infinite light, unaffected by standard planetary time
        if (map.includes('Atzilut')) {
            grad.addColorStop(0, '#ffffff'); 
            grad.addColorStop(1, '#fff9c4');
        } else if (map.includes('Beriah')) {
            grad.addColorStop(0, '#fff9c4'); 
            grad.addColorStop(1, '#ffecb3');
        } else if (map.includes('Tehom')) {
            grad.addColorStop(0, '#000000'); 
            grad.addColorStop(1, '#1a0000');
        } else {
            // Standard Asiyah and Yetzirah Time-Based Skies
            if (time === 'NIGHT') {
                grad.addColorStop(0, '#020024'); 
                grad.addColorStop(1, '#090979');
            } else if (time === 'DUSK') {
                grad.addColorStop(0, '#4a148c'); 
                grad.addColorStop(1, '#e65100');
            } else if (time === 'DAWN') {
                grad.addColorStop(0, '#0d47a1'); 
                grad.addColorStop(1, '#ffb300');
            } else {
                // DAY Time - Varies by local geography
                if (map.includes('YudDalet')) { 
                    grad.addColorStop(0, '#e0f7fa'); 
                    grad.addColorStop(1, '#b2ebf2'); 
                } else if (map.includes('YudHey')) { 
                    grad.addColorStop(0, '#8d6e63'); 
                    grad.addColorStop(1, '#d7ccc8'); 
                } else if (map.includes('Gimmel')) { 
                    grad.addColorStop(0, '#ffcc80'); 
                    grad.addColorStop(1, '#ffe082'); 
                } else { 
                    // Default lush Asiyah
                    grad.addColorStop(0, '#1b5e20'); 
                    grad.addColorStop(1, '#388e3c'); 
                }
            }
        }

        bgCtx.fillStyle = grad;
        bgCtx.fillRect(0, 0, W, H);
    }
}
