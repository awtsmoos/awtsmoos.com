
// B"H
import ZoomOrchestrator from "./ZoomOrchestrator.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import MouseDragOrchestrator from "./MouseDragOrchestrator.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

/**
 * @module CameraControls
 * @description
 * The physical translation of intent into spatial rotation and depth.
 * "And they turned whichever way the spirit moved them to go."
 */
export default {
    lerp(start, end, percent) {
        return (start + percent*(end - start));
    },

    lerpAngle(start, end, percent) {
        let difference = Math.abs(end - start);
        if (difference > 180) {
            if (end > start) {
                start += 360;
            } else {
                end += 360;
            }
        }

        let value = (start + ((end - start) * percent));
        let rangeZero = 360;

        if (value >= 0 && value <= 360) return value;
        return (value % rangeZero);
    },

    zoom(deltaY) {
        ZoomOrchestrator.applyZoom(this, deltaY);
    },

    panDown(amount) {
        this.userInputPhi += amount || this.panAmount
    },

    panUp(amount) {
        this.userInputPhi -= amount || this.panAmount
    },

    rotateAroundTarget(dx, dy) {
        MouseDragOrchestrator.applyRotation(this, dx, dy);
    },

    onMouseDown(event) {
        if (event.button === 0) this.mouseIsDown  = true;
        if (event.button === 2) this.rightMouseIsDown = true;
    },

    onRightMouseDown() {
        this.rightMouseIsDown = true;
    },

    onRightMouseUp() {
        this.rightMouseIsDown = true;
    },

    onMouseMove(event) {
        if (!this.mouseIsDown && !this.rightMouseIsDown) return;
        
        // B"H: Shift + Left Click allows continuous vertical pan calibration
        if(this.mouseIsDown && event.shiftKey) {
            let dy = event.movementY * 0.015;
            this.anchorOffset.y += dy;
            // Boundaries are widened safely so users aren't locked out of high or low perspectives
            this.anchorOffset.y = Math.max(-10, Math.min(this.anchorOffset.y, 10));
            return;
        }

        if(event.movementX !== 0 || event.movementY !== 0) {
            this.rotateAroundTarget(event.movementX, event.movementY);
        }
    },

    onMouseUp(event) {
        if (event.button === 0) this.mouseIsDown = false;
        if (event.button === 2) this.rightMouseIsDown = false;
    }
};
