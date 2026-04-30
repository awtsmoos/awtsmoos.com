
// B"H
/**
 * @class VirtualJoystickLogic
 * @description
 * 🧭 THE COMPASS OF THE SOUL 🧭
 * 
 * Computes the angle and magnitude from the center of the base to the thumb.
 */
export default class VirtualJoystickLogic {
    /**
     * @method computeVector
     * @param {Object} data - VirtualJoystickData instance.
     * @param {number} currentX 
     * @param {number} currentY 
     * @returns {Object} Normalized vector { x, y }
     */
    static computeVector(data, currentX, currentY) {
        const dx = currentX - data.centerX;
        const dy = currentY - data.centerY;
        
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < data.deadzone) {
            return { x: 0, y: 0, magnitude: 0 };
        }
        
        // Normalize
        const nx = dx / dist;
        const ny = dy / dist;
        
        // Cap magnitude at base radius
        const magnitude = Math.min(dist, data.baseRadius) / data.baseRadius;
        
        return { x: nx, y: ny, magnitude };
    }
}
