
/**
 * B"H
 * @module DesktopMouseLogic
 * @description
 * 
 * "His eyes roam over the whole earth."
 * Extricates the desktop mouse rotation logic from the chaotic locks of pointer APIs.
 * Calculates absolute Delta (dx, dy) locally and sends pristine `cameraDrag` events,
 * identical to the flow established for the Mobile Angel.
 */

import Utils from "../../utils.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

export default function setupDesktopMouseLogic(eved, isUIElementFunc) {
    let isLeftMouseDown = false;
    let lastMousePos = null;

    // Speed synchronization with mobile rotation scales
    const TURN_INTENSITY = 1.2;

    const transmit = (eventName, data) => {
        eved.postMessage({ [eventName]: data });
    };

    window.addEventListener('mousedown', (event) => {
        // Prevent action if clicking UI
        if (isUIElementFunc(event.target)) return;

        // Button 0 = Left Click
        if (event.button === 0) {
            isLeftMouseDown = true;
            lastMousePos = { x: event.clientX, y: event.clientY };
            
            transmit("mousedown", Utils.clone(event));
        }
    });

    window.addEventListener('mouseup', (event) => {
        if (event.button === 0) {
            isLeftMouseDown = false;
            lastMousePos = null;
        }
        transmit("mouseup", Utils.clone(event));
    });

    window.addEventListener('mousemove', (event) => {
        // 1. Independent Camera Spin Matrix
        if (isLeftMouseDown && lastMousePos) {
            const dx = event.clientX - lastMousePos.x;
            const dy = event.clientY - lastMousePos.y;
            
            // Advance tracker safely
            lastMousePos = { x: event.clientX, y: event.clientY };

            transmit("cameraDrag", {
                dx: dx * TURN_INTENSITY,
                dy: dy * TURN_INTENSITY
            });
        }
        
        // 2. Transmit standard event (for hovered states)
        const cloned = Utils.clone(event);
        if (cloned) {
            cloned.isOverUI = isUIElementFunc(event.target);
            transmit("mousemove", cloned);
        }
    });
}
