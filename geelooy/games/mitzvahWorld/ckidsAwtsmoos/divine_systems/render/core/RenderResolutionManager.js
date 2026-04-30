
// B"H
/**
 * @class RenderResolutionManager
 * @description
 * 📏 THE MEASURER OF THE FIRMAMENT 📏
 */
export default class RenderResolutionManager {
    constructor() {
        this.width = 1920;
        this.height = 1080;
        this.pixelRatio = 1;
    }

    setDimensions(w, h, pr) {
        this.width = w;
        this.height = h;
        this.pixelRatio = pr || this.pixelRatio;
    }

    getAspect() {
        if (this.height === 0) return 1;
        return this.width / this.height;
    }
}
