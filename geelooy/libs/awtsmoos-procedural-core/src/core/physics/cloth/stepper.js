
// B"H
/**
 * @file stepper.js
 * @brief Executes a single, sub-divided step of cloth integration and collision.
 */
import { applyEnvironmentForces } from './environment.js';
import { handleClothCollisions } from './clothCollision.js';
import { handleSelfCollision } from './clothSelfCollision.js';

export function performClothStep(system, dt) {
    applyEnvironmentForces(system);

    system.objects.forEach(cloth => {
        cloth.integrate(dt);

        handleClothCollisions(cloth, system.staticColliders);
        cloth.solveConstraints();
        handleClothCollisions(cloth, system.staticColliders);
        handleSelfCollision(cloth);
    });
}
