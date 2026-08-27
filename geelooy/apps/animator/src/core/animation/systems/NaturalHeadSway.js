// B"H
import { SpringDynamics } from '../components/SpringDynamics.js';

export class NaturalHeadSway {
    static update(pos, time) {
        // Broad gaze shifting
        const primary = Math.sin(time * 0.0005) * 2.5; 
        // Focus tremor
        const secondary = Math.sin(time * 0.003) * 0.5;
        // Postural micro-adjustments
        const tertiary = Math.cos(time * 0.0017) * 1.5;
        
        return pos + primary + secondary + tertiary;
    }
}
