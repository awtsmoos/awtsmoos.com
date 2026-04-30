
// B"H
/**
 * @module MobileTouchLogic
 * @description
 * "With a finger of G-d..." (Shemot 8:15)
 * 
 * This module manages the multi-touch matrix of the mobile world.
 * It distinguishes between three spiritual modes of touch:
 * 1. THE STEERING (Joystick): Handled by the joystick thumb directly.
 * 2. THE GAZE (Rotation): One finger swiping in the open void.
 * 3. THE EXPANSION (Pinch Zoom): Two fingers moving apart or together.
 */

export default function setupMobileTouchLogic(eved) {
    if (!navigator.userAgent.includes("Mobile")) return;

    let joystickTouchId = null;
    let gazeTouchId = null;
    let secondTouchId = null; // Used for pinching
    
    let initialJoyX = 0, initialJoyY = 0;
    let lastGazePoint = null;
    let lastPinchDist = 0;

    const ROTATION_SPEED = 3.5; // Increased for swift mobile response
    const ZOOM_SENSITIVITY = 0.08;

    const transmit = (type, payload) => eved.postMessage({ [type]: payload });

    const getDist = (t1, t2) => Math.hypot(t2.pageX - t1.pageX, t2.pageY - t1.pageY);

    window.addEventListener("touchstart", (e) => {
        for (let i = 0; i < e.changedTouches.length; i++) {
            const touch = e.changedTouches[i];
            
            // 1. IS THIS TOUCH MEANT FOR THE UI?
            const isJoystick = touch.target.closest('#joystick-base');
            const isButton = touch.target.closest('.controller-button, .awtsmoosBtn, .mitzvahBtn, .gameMenu, .inventory-body');

            if (isJoystick) {
                if (joystickTouchId === null) {
                    joystickTouchId = touch.identifier;
                    initialJoyX = touch.pageX;
                    initialJoyY = touch.pageY;
                }
                continue;
            }

            if (isButton) {
                continue; // The button's own event listeners will handle it!
            }

            // 2. THE PRIMARY GAZE (Touching the void)
            if (gazeTouchId === null) {
                gazeTouchId = touch.identifier;
                lastGazePoint = { x: touch.pageX, y: touch.pageY };
                
                // Emulate click-start for raycasting logic
                transmit("mousedown", { button: 0, clientX: touch.clientX, clientY: touch.clientY });
            } 
            // 3. THE SECONDARY FINGER (PINCH ZOOM)
            else if (secondTouchId === null) {
                secondTouchId = touch.identifier;
                const t1 = Array.from(e.touches).find(t => t.identifier === gazeTouchId);
                if (t1) lastPinchDist = getDist(t1, touch);
            }
        }
    }, { passive: false });

    window.addEventListener("touchmove", (e) => {
        let t1 = null, t2 = null;

        for (let i = 0; i < e.touches.length; i++) {
            const t = e.touches[i];
            if (t.identifier === gazeTouchId) t1 = t;
            if (t.identifier === secondTouchId) t2 = t;
        }

        // B"H PINCH TO ZOOM DECREE
        if (t1 && t2) {
            const dist = getDist(t1, t2);
            const deltaDist = dist - lastPinchDist;
            
            // Negative delta = moving together = zoom out
            transmit("wheel", { deltaY: -deltaDist * ZOOM_SENSITIVITY * 100 });
            
            lastPinchDist = dist;
            if(e.cancelable) e.preventDefault();
            return; 
        }

        // B"H GAZE ROTATION DECREE (Swiping the void)
        if (t1 && lastGazePoint) {
            const dx = t1.pageX - lastGazePoint.x;
            const dy = t1.pageY - lastGazePoint.y;
            
            transmit("cameraDrag", {
                dx: dx * ROTATION_SPEED,
                dy: dy * ROTATION_SPEED
            });
            
            lastGazePoint = { x: t1.pageX, y: t1.pageY };
            if(e.cancelable) e.preventDefault();
        }

        // JOYSTICK STEERING DECREE
        const joyTouch = Array.from(e.touches).find(t => t.identifier === joystickTouchId);
        if (joyTouch) {
            handleJoystickMove(joyTouch.pageX - initialJoyX, joyTouch.pageY - initialJoyY, transmit);
            if(e.cancelable) e.preventDefault();
        }
    }, { passive: false });

    window.addEventListener("touchend", (e) => {
        for (let i = 0; i < e.changedTouches.length; i++) {
            const id = e.changedTouches[i].identifier;
            
            if (id === joystickTouchId) {
                joystickTouchId = null;
                resetJoystick();
                ['KeyW', 'KeyS', 'KeyA', 'KeyD'].forEach(code => transmit("keyup", { code }));
            }
            if (id === gazeTouchId) {
                gazeTouchId = null; lastGazePoint = null;
                transmit("mouseup", { button: 0 });
            }
            if (id === secondTouchId) {
                secondTouchId = null; lastPinchDist = 0;
            }
        }
    });

    window.addEventListener("touchcancel", (e) => {
         // Same logic as end to prevent stuck fingers
         for (let i = 0; i < e.changedTouches.length; i++) {
            const id = e.changedTouches[i].identifier;
            if (id === joystickTouchId) {
                joystickTouchId = null; resetJoystick();
                ['KeyW', 'KeyS', 'KeyA', 'KeyD'].forEach(code => transmit("keyup", { code }));
            }
            if (id === gazeTouchId) { gazeTouchId = null; lastGazePoint = null; transmit("mouseup", { button: 0 }); }
            if (id === secondTouchId) { secondTouchId = null; lastPinchDist = 0; }
        }
    });

    // Helper: Steering Logic
    function handleJoystickMove(dx, dy, callback) {
        let angle = Math.atan2(dy, dx) * 180 / Math.PI;
        if (angle < 0) angle += 360;
        
        const keys = { up:'KeyW', down:'KeyS', left:'KeyA', right:'KeyD' };
        
        // Wipe slate clean
        Object.values(keys).forEach(k => callback("keyup", { code: k }));

        if (angle >= 337.5 || angle < 22.5) callback("keydown", { code: keys.right });
        else if (angle >= 22.5 && angle < 67.5) { callback("keydown", { code: keys.right }); callback("keydown", { code: keys.down }); }
        else if (angle >= 67.5 && angle < 112.5) callback("keydown", { code: keys.down });
        else if (angle >= 112.5 && angle < 157.5) { callback("keydown", { code: keys.left }); callback("keydown", { code: keys.down }); }
        else if (angle >= 157.5 && angle < 202.5) callback("keydown", { code: keys.left });
        else if (angle >= 202.5 && angle < 247.5) { callback("keydown", { code: keys.left }); callback("keydown", { code: keys.up }); }
        else if (angle >= 247.5 && angle < 292.5) callback("keydown", { code: keys.up });
        else { callback("keydown", { code: keys.up }); callback("keydown", { code: keys.right }); }

        const thumb = document.getElementById('joystick-thumb');
        if (thumb) {
            const max = 60, dist = Math.min(max, Math.sqrt(dx*dx + dy*dy)), a = Math.atan2(dy, dx);
            thumb.style.left = (dist * Math.cos(a) + 75 - 30) + 'px';
            thumb.style.top = (dist * Math.sin(a) + 75 - 30) + 'px';
        }
    }

    function resetJoystick() {
        const thumb = document.getElementById('joystick-thumb');
        if (thumb) { thumb.style.left = ""; thumb.style.top = ""; }
    }
}
