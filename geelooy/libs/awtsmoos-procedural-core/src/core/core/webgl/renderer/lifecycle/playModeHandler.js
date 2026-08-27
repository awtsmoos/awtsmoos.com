
// B"H
/**
 * @file playModeHandler.js
 * @brief Handles the transition between omniscient observation and physical embodiment.
 */

export function setPlayMode(renderer, enabled) {
    renderer.isPlaying = enabled;
    
    if (enabled) {
        console.log("B\"H - Play Mode: ENGAGED.");
        renderer.inputManager.enable();
        
        const player = renderer.objectMap.get('golem_manifest');
        if (player) {
            renderer.playerController.setPlayerObject(player);
            renderer.isCameraAnimationEnabled = false;
            
            // Adjust Camera
            const pos = player.keyframes[0].position;
            renderer.camera.state.radius = 15;
            renderer.camera.state.beta = 0.2; 
            renderer.camera.state.target = [...pos];
            renderer.camera.state.isDirty = true;
        } else {
            console.warn("B\"H - Play Mode: No 'golem_manifest' found in the world.");
        }
    } else {
        console.log("B\"H - Play Mode: DISENGAGED.");
        renderer.inputManager.disable();
        renderer.playerController.setAnimation('idle'); 
        renderer.isCameraAnimationEnabled = true;
    }
}
