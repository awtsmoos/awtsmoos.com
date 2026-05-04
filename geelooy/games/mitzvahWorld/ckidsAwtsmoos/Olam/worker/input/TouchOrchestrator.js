
/**
 * @module TouchOrchestrator
 * @description
 * 👆 CHAPTER 4: THE FINGERS OF REVELATION 👆
 * 
 * On a mobile vessel, the soul uses multiple fingers (touches). 
 * One finger might move the Joystick, while another rotates the firmament.
 * This class orchestrates this complexity, ensuring the signals 
 * do not become intertwined in the void.
 */
import SefiraOfInput from './SefiraOfInput.js';

export default class TouchOrchestrator {
    static bind(worker) {
        if (!navigator.userAgent.includes("Mobile")) return;

        let activeGazeTouchId = null;

        window.addEventListener('touchstart', (e) => {
            for (let i = 0; i < e.changedTouches.length; i++) {
                const touch = e.changedTouches[i];
                if (SefiraOfInput.isUI(touch.target)) continue;

                // If not a UI element and not the joystick, it must be the Gaze.
                if (activeGazeTouchId === null) {
                    activeGazeTouchId = touch.identifier;
                    worker.postMessage({ 
                        mousedown: { 
                            ...SefiraOfInput.cleanseEvent(touch), 
                            button: 0 
                        } 
                    });
                }
            }
        }, { passive: false });

        window.addEventListener('touchmove', (e) => {
            for (let i = 0; i < e.changedTouches.length; i++) {
                const touch = e.changedTouches[i];
                if (touch.identifier === activeGazeTouchId) {
                    // Simulating MouseMovement for rotation
                    worker.postMessage({
                        cameraDrag: {
                            dx: touch.movementX || 0, // Fallback needed for some mobile browsers
                            dy: touch.movementY || 0
                        }
                    });
                    
                    if (e.cancelable) e.preventDefault();
                }
            }
        }, { passive: false });

        window.addEventListener('touchend', (e) => {
            for (let i = 0; i < e.changedTouches.length; i++) {
                const touch = e.changedTouches[i];
                if (touch.identifier === activeGazeTouchId) {
                    activeGazeTouchId = null;
                    worker.postMessage({ mouseup: { button: 0 } });
                }
            }
        });

        // B"H: silent

    }
}
