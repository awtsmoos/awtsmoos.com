
// B"H
/**
 * @file physics.js
 * @description Guarding the boundaries of the physical world.
 */

export function checkAbyss(playerBody, resetPoint = { x: 0, y: 10, z: 0 }) {
    if (!playerBody) return;

    if (playerBody.position.y < -25) {
        console.warn('B"H - ⚠️ Abyss Breach! Invoking Resurrection.');
        playerBody.velocity.set(0, 0, 0);
        playerBody.angularVelocity.set(0, 0, 0);
        playerBody.position.set(resetPoint.x, resetPoint.y, resetPoint.z);
    }
}

export function physicsUpdate(world, playerBody) {
    try {
        world.step(1/60);
        checkAbyss(playerBody);
    } catch (e) {
        console.error('B"H - 🔥 Physics Tzimtzum Error:', e);
    }
}
    