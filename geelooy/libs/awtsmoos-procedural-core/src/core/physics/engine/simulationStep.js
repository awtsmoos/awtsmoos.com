
// B"H
import { CollisionSolver } from './collisionSolver.js';

export function stepPhysicsSimulation(world, dt) {
    // 1. Integrate forces
    world.bodies.forEach(b => b.integrate(dt, world.gravity));

    // 2. Solve dynamic vs. static (Octree based for complex ground)
    world.bodies.forEach(body => {
        if (body.isStatic) return;
        
        for (const collider of world.staticColliders) {
            const candidates = collider.octree.querySphere(body.pos, body.radius * 2.5);
            for (const triIdx of candidates) {
                const tm = collider.mesh;
                const i0 = tm.indices[triIdx*3], i1 = tm.indices[triIdx*3+1], i2 = tm.indices[triIdx*3+2];
                const p0 = [tm.positions[i0*3], tm.positions[i0*3+1], tm.positions[i0*3+2]];
                const p1 = [tm.positions[i1*3], tm.positions[i1*3+1], tm.positions[i1*3+2]];
                const p2 = [tm.positions[i2*3], tm.positions[i2*3+1], tm.positions[i2*3+2]];
                
                CollisionSolver.checkAndResolveSphereTriangle(body, p0, p1, p2);
            }
        }
        
        // 3. Absolute Recovery Reset
        // B"H - Droplets return to source above stump (Z=-250)
        if (body.pos[1] < -600.0) {
            body.pos = [(Math.random()-0.5)*25, 400, (Math.random()-0.5)*25 - 250]; 
            body.velocity = [0, -60, 0];
        }
    });

    // 4. Solve dynamic vs. dynamic
    for (let i = 0; i < world.bodies.length; i++) {
        for (let j = i + 1; j < world.bodies.length; j++) {
            const b1 = world.bodies[i];
            const b2 = world.bodies[j];
            CollisionSolver.checkAndResolveSphereSphere(b1, b2);
        }
    }
}
