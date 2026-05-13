
import { StateRegister } from '../../../binah/StateRegister.js';

/**
 * B"H
 * @class WeatherRenderer
 * @chapter The Tears of the Heavens
 * @description
 * "Let my teaching drop as the rain, my speech distill as the dew..." (Deut 32:2).
 * Paints the weather overlay across the entire canvas natively.
 * Chesed (Rain) flows fast and straight.
 * Gevurah (Snow) drifts slowly, chilling the air.
 */
export class WeatherRenderer {
    static draw(ctx, w, h) {
        const weather = StateRegister.Weather;
        if (weather.type === 'CLEAR' || weather.intensity <= 0) return;

        ctx.save();
        const time = performance.now();
        const intensity = weather.intensity;

        if (weather.type === 'RAIN_CHESED') {
            this._drawRain(ctx, w, h, time, intensity);
        } else if (weather.type === 'SNOW_GEVURAH') {
            this._drawSnow(ctx, w, h, time, intensity);
        }

        ctx.restore();
    }

    static _drawRain(ctx, w, h, time, intensity) {
        ctx.strokeStyle = 'rgba(0, 229, 255, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';
        
        const numDrops = Math.floor(100 * intensity);
        ctx.beginPath();
        
        for (let i = 0; i < numDrops; i++) {
            // Pseudo-random but deterministic loop
            const x = (Math.sin(i * 13) * 10000 + (time * 0.1)) % w;
            const y = (Math.cos(i * 17) * 10000 + (time * 1.5)) % h;
            
            // Ensure positive coordinates
            const px = (x + w) % w;
            const py = (y + h) % h;
            
            ctx.moveTo(px, py);
            ctx.lineTo(px - 10, py + 30);
        }
        ctx.stroke();
    }

    static _drawSnow(ctx, w, h, time, intensity) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.shadowBlur = 5;
        ctx.shadowColor = '#fff';
        
        const numFlakes = Math.floor(150 * intensity);
        ctx.beginPath();
        
        for (let i = 0; i < numFlakes; i++) {
            const xOffset = Math.sin(time * 0.001 + i) * 20;
            const x = (Math.sin(i * 31) * 10000 + xOffset) % w;
            const y = (Math.cos(i * 47) * 10000 + (time * 0.2)) % h;
            
            const px = (x + w) % w;
            const py = (y + h) % h;
            const radius = 1 + Math.abs(Math.sin(i)) * 2;
            
            ctx.moveTo(px, py);
            ctx.arc(px, py, radius, 0, Math.PI * 2);
        }
        ctx.fill();
    }
}
