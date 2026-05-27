
/**
 * B"H
 * DOM Event Listeners for Olam Worker Manager
 */
import Utils from "../../utils.js";

export default function setupDomEvents(manager) {
    const { eved } = manager;

    // Helper to check if event should be processed
    function ch(event) {
        let el = event.target;
        while (el && el !== document.body && el !== document.documentElement) {
            const className = el.className;
            const classNameStr = (typeof className === 'string') ? className : (className && className.baseVal || '');
            
            if (el.tagName === "BUTTON" || el.tagName === "P" || el.classList.contains("controller-button") || el.awtsmoosClick) {
                return false;
            }
            el = el.parentElement;
        }
        return true;
    }

    function hasParentWithClass(element, classString) {
        let currentElement = element;
        while (currentElement && currentElement !== document.body) {
            const className = currentElement.className;
            const classNameStr = (typeof className === 'string') ? className : (className && className.baseVal || '');
            if (classNameStr.includes(classString)) {
                return true;
            }
            currentElement = currentElement.parentElement;
        }
        return false;
    }

    function send(type, event) {
        const cloned = Utils.clone(event);
        if (cloned) {
            eved.postMessage({[type]: cloned});
        }
    }

    window.addEventListener('resize', () => {
        eved.postMessage({'resize': { width: innerWidth, height: innerHeight }});
    });

    window.addEventListener('keydown', (event) => {
        send("keydown", event);
    });

    window.addEventListener('keyup', (event) => {
        send("keyup", event);
    });

    window.addEventListener("contextmenu", e => {
        if (e.target.tagName != "P") e.preventDefault();
    });

    window.addEventListener('mousedown', (event) => {
        let el = event.target;
        let className = el.className;
        let classNameStr = (typeof className === 'string') ? className : (className && className.baseVal || '');

        if (hasParentWithClass(el, "awtsmoosBtn")) return;
        if (classNameStr.includes("menuTop") || classNameStr.includes("mitzvahBtn")) return;

        if (el.tagName !== "svg" && el.tagName !== "path" && el.tagName !== "rect") {
            if (ch(event)) send("mousedown", event);
        }
    });

    window.addEventListener('mouseup', (event) => {
        send("mouseup", event);
    });

    window.addEventListener('mousemove', (event) => {
        send("mousemove", event);
    });

    window.addEventListener('wheel', (event) => {
        if (ch(event)) send("wheel", event);
    });

    // Mobile Controls Logic
    setupMobileControls(manager);
}

function setupMobileControls(manager) {
    if (!navigator.userAgent.includes("Mobile")) return;

    const { eved } = manager;
    let joystickActive = false;
    let lastJoystickTouchId = null;
    let initialTouchX, initialTouchY;
    let lastTouchStart = null;

    // Constants from original file
    const ZOOM_INTENSITY = 26; 
    const TURN_INTENSITY = 1.3;

    function send(type, event) {
        const cloned = Utils.clone(event);
        if (cloned) {
            eved.postMessage({[type]: cloned});
        }
    }

    window.addEventListener("touchstart", event => {
        const joystickBase = document.getElementById('joystick-base');
        const joystickThumb = document.getElementById('joystick-thumb');

        if (event.target.tagName === "BUTTON" || event.target.classList.contains("controller-button")) {
            if (event.touches.length === 2) event.target.click();
            return;
        }

        const touch = event.touches[0];
        
        if (joystickBase && (event.target === joystickBase || event.target === joystickThumb)) {
            joystickActive = true;
            lastJoystickTouchId = touch.identifier;
            initialTouchX = touch.pageX;
            initialTouchY = touch.pageY;
            return;
        } 
        
        // Camera movement touch
        const activeTouch = event.touches[0]; 
        const clonedTouch = Utils.clone(activeTouch);
        clonedTouch.button = 2; // Right click emulation
        clonedTouch.isAwtsmoosMobile = true;
        
        if (!lastTouchStart) {
            lastTouchStart = { ...clonedTouch, movementX: 0, movementY: 0 };
            clonedTouch.movementX = 0;
            clonedTouch.movementY = 0;
        } else {
            clonedTouch.movementX = activeTouch.screenX - lastTouchStart.screenX;
            clonedTouch.movementY = activeTouch.screenY - lastTouchStart.screenY;
            lastTouchStart = { ...clonedTouch };
        }
        
        eved.postMessage({"mousedown": clonedTouch});
    });

    window.addEventListener("touchend", event => {
        if (event.target.tagName === "BUTTON") return;
        
        const changedJoystick = Array.from(event.changedTouches).find(t => t.identifier === lastJoystickTouchId);
        
        if (changedJoystick) {
            const base = document.getElementById('joystick-base');
            const thumb = document.getElementById('joystick-thumb');
            if(thumb) {
                thumb.style.left = "";
                thumb.style.top = "";
            }
            joystickActive = false;
            lastJoystickTouchId = null;
            
            // Reset keys
            ['KeyW', 'KeyS', 'KeyA', 'KeyD', 'KeyQ', 'KeyE'].forEach(code => {
                eved.postMessage({"keyup": { code }});
            });
            
            const t = Utils.clone(changedJoystick);
            t.button = 2;
            eved.postMessage({"mouseup": t});
        } else {
             // Main touch end
             const t = Utils.clone(event.changedTouches[0]);
             t.button = 2;
             eved.postMessage({"mouseup": t});
        }
        lastTouchStart = null;
    });

    window.addEventListener("touchmove", event => {
        if (event.target.tagName === "BUTTON") return;

        if (joystickActive) {
            const joystickTouch = Array.from(event.touches).find(t => t.identifier === lastJoystickTouchId);
            if (joystickTouch) {
                const deltaX = joystickTouch.pageX - initialTouchX;
                const deltaY = joystickTouch.pageY - initialTouchY;
                const direction = getJoystickDirection(deltaX, deltaY);
                
                const map = {
                    up: 'KeyW', down: 'KeyS', left: 'KeyQ', right: 'KeyE',
                    "up-left": ['KeyQ',"KeyW"], "up-right": ['KeyE',"KeyW"],
                    "down-left":["KeyQ","KeyS"], "down-right":["KeyE", "KeyS"]
                };

                // Reset all
                Object.values(map).flat().forEach(k => eved.postMessage({"keyup": { code: k }}));
                
                // Set new
                const keys = Array.isArray(map[direction]) ? map[direction] : [map[direction]];
                keys.forEach(k => eved.postMessage({"keydown": { code: k }}));
                
                // Visual update
                updateJoystickThumb(deltaX, deltaY);
            }
        } else if (event.touches.length === 1) {
            const t = Utils.clone(event.touches[0]);
            t.button = 2;
            t.isAwtsmoosMobile = true;
            
            // Calculate movement
            if (lastTouchStart) {
                 t.movementX = (t.screenX - lastTouchStart.screenX) * TURN_INTENSITY;
                 t.movementY = (t.screenY - lastTouchStart.screenY) * TURN_INTENSITY;
                 lastTouchStart = t;
            }
            eved.postMessage({"mousemove": t});
        }
    });
}

function getJoystickDirection(deltaX, deltaY) {
    let angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
    if (angle < 0) angle += 360;
    if (angle >= 337.5 || angle < 22.5) return 'right';
    if (angle >= 22.5 && angle < 67.5) return 'down-right';
    if (angle >= 67.5 && angle < 112.5) return 'down';
    if (angle >= 112.5 && angle < 157.5) return 'down-left';
    if (angle >= 157.5 && angle < 202.5) return 'left';
    if (angle >= 202.5 && angle < 247.5) return 'up-left';
    if (angle >= 247.5 && angle < 292.5) return 'up';
    return 'up-right';
}

function updateJoystickThumb(deltaX, deltaY) {
    const base = document.getElementById('joystick-base');
    const thumb = document.getElementById('joystick-thumb');
    if (!base || !thumb) return;
    
    const rect = base.getBoundingClientRect();
    const maxDist = rect.width / 2;
    const dist = Math.min(maxDist, Math.sqrt(deltaX*deltaX + deltaY*deltaY));
    const angle = Math.atan2(deltaY, deltaX);
    
    const x = dist * Math.cos(angle) + maxDist - thumb.offsetWidth/2;
    const y = dist * Math.sin(angle) + maxDist - thumb.offsetHeight/2;
    
    thumb.style.left = x + 'px';
    thumb.style.top = y + 'px';
}
