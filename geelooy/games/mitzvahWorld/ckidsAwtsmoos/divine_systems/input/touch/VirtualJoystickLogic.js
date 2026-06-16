// B"H
/**
 * @class VirtualJoystickLogic
 * @description
 * The Compass was facing the exile-mirror. The thumb moved east and the body
 * answered west. Now the vessel reverses the raw screen delta before it enters
 * the movement soul, so mobile control follows the player's hand.
 */
export default class VirtualJoystickLogic {
    /**
     * @method computeVector
     * @param {Object} data - VirtualJoystickData instance.
     * @param {number} currentX
     * @param {number} currentY
     * @returns {Object} Normalized vector { x, y, magnitude }
     */
    static computeVector(data, currentX, currentY) {
        const dx = data.centerX - currentX;
        const dy = data.centerY - currentY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < data.deadzone) return { x: 0, y: 0, magnitude: 0 };
        const nx = dx / dist;
        const ny = dy / dist;
        const magnitude = Math.min(dist, data.baseRadius) / data.baseRadius;
        return { x: nx, y: ny, magnitude };
    }
}
