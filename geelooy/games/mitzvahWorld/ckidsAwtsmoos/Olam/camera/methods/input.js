// B"H

export default {
    onMouseDown(event) {
        if (event.button === 0) {
            this.mouseIsDown = true;
        }
        if (event.button == 2) {
            this.rightMouseIsDown = true;
        }
    },

    onRightMouseDown() {
        this.rightMouseIsDown = true;
    },

    onRightMouseUp() {
        this.rightMouseIsDown = true;
    },

    onMouseMove(event) {
        if ((this.mouseIsDown || this.rightMouseIsDown) && (event.movementX !== 0 || event.movementY !== 0)) {
            let dx = event.movementX * (this.xSpeed / this.width);
            let dy = event.movementY * (this.ySpeed / this.height);
            this.rotateAroundTarget(dx, dy);
        }
    },

    onMouseUp(event) {
        if (event.button === 0) {
            this.mouseIsDown = false;
        }
        if (event.button == 2) {
            this.rightMouseIsDown = false;
        }
    }
};
