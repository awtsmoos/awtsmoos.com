// B"H
export default {
    lerp(start, end, percent) {
        return (start + percent*(end - start));
    },

    lerpAngle(start, end, percent) {
        let difference = Math.abs(end - start);
        if (difference > 180) {
            // We need to add on to one of the values.
            if (end > start) {
                // We'll add it on to start...
                start += 360;
            } else {
                // Add it on to end.
                end += 360;
            }
        }

        // Interpolate it.
        let value = (start + ((end - start) * percent));

        // Wrap it..
        let rangeZero = 360;

        if (value >= 0 && value <= 360)
            return value;

        return (value % rangeZero);
    },

    zoom(deltaY) {
        this.newMovement=true;
        this.deltaY = (typeof deltaY === 'number' && !isNaN(deltaY)) ? deltaY : 0;
    },

    panDown(amount) {
        this.userInputPhi += amount || this.panAmount
    },

    panUp(amount) {
        this.userInputPhi -= amount || this.panAmount
    },

    rotateAroundTarget(dx, dy) {
        this.newMovement=true
        // Convert degrees to radians
        var degreeToRadian = Math.PI / 180;
        // Update the theta and phi values based on the mouse movement
        this.userInputTheta += dx * this.xSpeed * degreeToRadian;
        this.userInputPhi -= dy * this.ySpeed * degreeToRadian;
    },

    
    onMouseDown(event) {
        if (event.button === 0) {
            this.mouseIsDown  = true;
        }

        if(event.button == 2) {
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
        
        if(
            (this.mouseIsDown || this.rightMouseIsDown)
            && 
            (event.movementX !== 0 || event.movementY !== 0)
        ) {
            let dx = event.movementX * (this.xSpeed / this.width);
            let dy = event.movementY * (this.ySpeed / this.height);
            
            
            this.rotateAroundTarget(dx, dy);
        }
    },

    onMouseUp(event) {
        if (event.button === 0) {
            this.mouseIsDown = false;
        }

        if(event.button == 2) {
            this.rightMouseIsDown = false;
        }
    }
};
