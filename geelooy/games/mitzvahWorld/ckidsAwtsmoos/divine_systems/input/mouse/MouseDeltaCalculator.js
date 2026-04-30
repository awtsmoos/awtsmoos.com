
// B"H
/**
 * @class MouseDeltaCalculator
 * @description
 * 📐 THE SCALES OF MEASUREMENT 📐
 * 
 * Computes the delta (change) in mouse position, providing the raw rotational 
 * velocity for the camera systems. "He weighs the mountains in scales."
 */
export default class MouseDeltaCalculator {
    constructor() {
        this.lastX = 0;
        this.lastY = 0;
    }

    /**
     * @method calculate
     * @param {number} currentX 
     * @param {number} currentY 
     * @returns {Object} { dx, dy }
     */
    calculate(currentX, currentY) {
        const dx = currentX - this.lastX;
        const dy = currentY - this.lastY;
        
        this.lastX = currentX;
        this.lastY = currentY;
        
        return { dx, dy };
    }
    
    reset(x, y) {
        this.lastX = x;
        this.lastY = y;
    }
}
