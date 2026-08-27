
// B"H
/**
 * @file environment.js
 * @brief Exposes the cloth to the forces of the universe.
 */
import { ForceUtils } from './forces.js';

export function applyEnvironmentForces(system) {
    system.objects.forEach(cloth => {
        ForceUtils.applyGravity(cloth.particles, system.gravity);
        
        if (system.wind[0] !== 0 || system.wind[1] !== 0 || system.wind[2] !== 0) {
             ForceUtils.applyWind(cloth.particles, system.wind, 0.04, system.time);
        }

        if (system.gustDuration > 0) {
            ForceUtils.applyGust(cloth.particles, system.gustVector);
        }
    });
}
