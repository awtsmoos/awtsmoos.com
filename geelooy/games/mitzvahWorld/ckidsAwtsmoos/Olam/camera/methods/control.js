// B"H
export default {
    zoom(deltaY) {
        this.newMovement = true;
        this.deltaY = (typeof deltaY === 'number' && !isNaN(deltaY)) ? deltaY : 0;
    },

    panDown(amount) {
        this.userInputPhi += amount || this.panAmount;
    },

    panUp(amount) {
        this.userInputPhi -= amount || this.panAmount;
    },

    rotateAroundTarget(dx, dy) {
        this.newMovement = true;
        var degreeToRadian = Math.PI / 180;
        this.userInputTheta += dx * this.xSpeed * degreeToRadian;
        this.userInputPhi -= dy * this.ySpeed * degreeToRadian;
    },

    clampAngle(angle, min, max) {
        if (angle < -360) angle += 360;
        if (angle > 360) angle -= 360;
        return Math.max(Math.min(angle, max), min);
    },

    lerp(start, end, percent) {
        return (start + percent * (end - start));
    }
};
