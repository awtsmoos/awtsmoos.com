// B"H
import { SpringDynamics } from '../components/SpringDynamics.js';

/**
 * @file NaturalBreath.js
 * @description THE RHYTHM OF LIFE.
 * Hyper-realistic biological breath variation instead of a single sine wave.
 */
export class NaturalBreath {
    static update(data, time) {
        // Deep breath cycle
        const fundamental = Math.sin(time * 0.0015) * 0.015;
        // Minor flutter (chest expansion)
        const secondary = Math.sin(time * 0.004) * 0.003;
        // Nervous or active pulse
        const tertiary = (data.stress || 0) * Math.sin(time * 0.01) * 0.005;
        
        return 1.0 + fundamental + secondary + tertiary;
    }
}
