
import { StateRegister } from '../binah/StateRegister.js';

/**
 * B"H
 * @class SederHaZman
 * @chapter The Turning of the Heavenly Spheres
 * @description
 * "He changes the times and seasons..." (Daniel 2:21).
 * Time is not a constant; it is a creation. It breathes. 
 * This module measures the flow of the physical clock and maps it to 
 * the spiritual reality of the simulation. 
 * 
 * On Shabbos, the world rests. The Klipot recede.
 * During the New Moon, the light is concealed (Tzimtzum), testing faith.
 */
export class SederHaZman {
    static _lastCheck = 0;

    /**
     * @description Pulses the time engine, updating the celestial bodies.
     * Called by the SederEngine every few frames.
     */
    static digestTime(now) {
        if (now - this._lastCheck < 1000) return; // Only calculate once per second
        this._lastCheck = now;

        const date = new Date();
        const day = date.getDay(); // 0 = Sunday, 5 = Friday, 6 = Shabbos
        const hours = date.getHours();

        // Shabbos Logic: Friday evening to Saturday night
        const isFridayNight = day === 5 && hours >= 18;
        const isSaturdayDay = day === 6 && hours < 19;
        
        StateRegister.TimeState.isShabbos = isFridayNight || isSaturdayDay;

        // Time of Day mapping
        if (hours >= 6 && hours < 17) StateRegister.TimeState.timeOfDay = 'DAY';
        else if (hours >= 17 && hours < 19) StateRegister.TimeState.timeOfDay = 'DUSK';
        else if (hours >= 19 || hours < 5) StateRegister.TimeState.timeOfDay = 'NIGHT';
        else StateRegister.TimeState.timeOfDay = 'DAWN';

        // Simulated Moon Phase (Cycles every 29.5 simulated minutes for gameplay visibility)
        const simCycle = (now % (29.5 * 60 * 1000)) / (29.5 * 60 * 1000);
        StateRegister.TimeState.moonPhase = Math.abs(Math.sin(simCycle * Math.PI));

        this._determineWeather();
    }

    /**
     * @description The Heavens weep or freeze based on the Sefirotic alignment of the hour.
     */
    static _determineWeather() {
        // Simple deterministic weather based on map and time
        const map = StateRegister.CurrentMapId;
        if (map.includes('YudDalet')) {
            StateRegister.Weather.type = 'SNOW_GEVURAH';
            StateRegister.Weather.intensity = 0.8;
        } else if (map.includes('YudVav') && StateRegister.TimeState.timeOfDay === 'NIGHT') {
            StateRegister.Weather.type = 'RAIN_CHESED';
            StateRegister.Weather.intensity = 0.5;
        } else {
            StateRegister.Weather.type = 'CLEAR';
            StateRegister.Weather.intensity = 0.0;
        }
    }
}
