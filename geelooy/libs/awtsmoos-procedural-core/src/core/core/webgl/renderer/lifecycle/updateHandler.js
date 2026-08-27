
// B"H
/**
 * @file updateHandler.js
 * @brief The temporal heartbeat of the simulation systems.
 */

export function handleUpdate(renderer, dt) {
    // 1. Embodiment Physics
    if (renderer.isPlaying && renderer.playerController) {
        renderer.playerController.update(dt);
    }
    
    // 2. World Physics
    if (renderer.systemManager) {
        const { clothSystem, rigidBodySystem, metaballSystem, liveCSGSystem } = renderer.systemManager.physicsSystems;
        if (clothSystem) clothSystem.update(dt);
        if (rigidBodySystem) rigidBodySystem.update(dt);
        if (metaballSystem) metaballSystem.update(dt);
        // B"H - Evaluate Real-Time Boolean Mathematics!
        if (liveCSGSystem) liveCSGSystem.update();
    }
}
