
// B"H
/**
 * @file controls.js
 * Camera control methods.
 */
export default {
    lerp(start, end, percent) {
        return (start + percent*(end - start));
    },

    lerpAngle(start, end, percent) {
        let difference = Math.abs(end - start);
        if (difference > 180) {
            if (end > start) start += 360;
            else end += 360;
        }

        let value = (start + ((end - start) * percent));
        let rangeZero = 360;
        if (value >= 0 && value <= 360) return value;
        return (value % rangeZero);
    },

    // B"H: Added missing clampAngle method
    clampAngle(angle, min, max) {
        if (angle < -360) angle += 360;
        if (angle > 360) angle -= 360;
        return Math.max(Math.min(angle, max), min);
    },

    zoom(deltaY) {
        this.newMovement=true;
        this.deltaY = (typeof deltaY === 'number' && !isNaN(deltaY)) ? deltaY : 0;
    },

    panDown(amount) {
        this.userInputPhi += amount || this.panAmount;
    },

    panUp(amount) {
        this.userInputPhi -= amount || this.panAmount;
    },

    /**
     * B"H: Rotate around target.
     * dx and dy are normalized screen movement.
     * We keep the internal accumulators in DEGREES.
     */
    rotateAroundTarget(dx, dy) {
        this.newMovement = true;
        this.userInputTheta += dx * this.xSpeed;
        this.userInputPhi -= dy * this.ySpeed;
    },

    onMouseDown(event) {
        if (event.button === 0) this.mouseIsDown = true;
        if (event.button === 2) this.rightMouseIsDown = true;
    },

    onRightMouseDown() {
        this.rightMouseIsDown = true;
    },

    onRightMouseUp() {
        this.rightMouseIsDown = false;
    },

    onMouseMove(event) {
        if ((this.mouseIsDown || this.rightMouseIsDown) && 
            (event.movementX !== 0 || event.movementY !== 0)) {
            let dx = event.movementX * (this.xSpeed / this.width);
            let dy = event.movementY * (this.ySpeed / this.height);
            this.rotateAroundTarget(dx, dy);
        }
    },

    onMouseUp(event) {
        if (event.button === 0) this.mouseIsDown = false;
        if (event.button === 2) this.rightMouseIsDown = false;
    }
};
