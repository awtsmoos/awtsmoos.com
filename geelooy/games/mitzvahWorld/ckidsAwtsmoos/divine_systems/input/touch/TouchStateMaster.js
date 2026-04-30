
// B"H
/**
 * @class TouchStateMaster
 * @description
 * 👆 THE TEN FINGERS OF EMANATION 👆
 * 
 * Maps multi-touch interactions. Each touch is a unique point of manifestation 
 * in the physical screen space.
 */
export default class TouchStateMaster {
    constructor() {
        this.activeTouches = new Map();
    }

    addTouch(id, x, y) {
        this.activeTouches.set(id, { x, y, startX: x, startY: y });
    }

    updateTouch(id, x, y) {
        if (this.activeTouches.has(id)) {
            const touch = this.activeTouches.get(id);
            touch.x = x;
            touch.y = y;
        }
    }

    removeTouch(id) {
        this.activeTouches.delete(id);
    }
    
    getTouch(id) {
        return this.activeTouches.get(id);
    }
}
