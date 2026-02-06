//B"H
/**
 * @file viewEffects.js
 * @description 
 * Aggregator for Visual Systems.
 * Binds the Scroll FX, the Hunter Observer, and the Scribe Lens.
 */
import { setupScrollUnrollEffect } from "./visuals/scrollEffects.js";
import { setupActiveVerseObserver, performGeometricCheck } from "./visuals/observer.js";
import { setupScribeLens } from "./visuals/lens.js";

/**
 * @method setupViewEffects
 * @description 
 * Initializes the visual world.
 * Ensures the Hunter starts measuring immediately.
 */
export function setupViewEffects() {
    console.log("B\"H - Visual Engine Ignition.");
    const scroller = document.querySelector('.scroll-view-wrapper');
    
    if (scroller) {
        // 1. Start the Observer (Hunter)
        setupActiveVerseObserver(scroller);
        
        // 2. Perform initial geometric sweep
        requestAnimationFrame(() => {
            performGeometricCheck();
        });
    }
    
    // 3. Setup Textures
    setupScrollUnrollEffect();
    
    // 4. Setup Lens
    setupScribeLens();
}

export { setupScrollUnrollEffect, setupScribeLens };