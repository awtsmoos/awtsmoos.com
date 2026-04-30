
// B"H
/**
 * @class VirtualJoystickData
 * @description
 * 🕹️ THE CHARIOT CONTROLS 🕹️
 * 
 * Holds the geometric data defining the boundaries and deadzones of the 
 * mobile movement apparatus.
 */
export default class VirtualJoystickData {
    constructor(baseRadius = 50, thumbRadius = 25) {
        this.baseRadius = baseRadius;
        this.thumbRadius = thumbRadius;
        this.deadzone = 5; // Pixels
        
        this.centerX = 0;
        this.centerY = 0;
        this.activeTouchId = null;
    }

    setCenter(x, y) {
        this.centerX = x;
        this.centerY = y;
    }
}
