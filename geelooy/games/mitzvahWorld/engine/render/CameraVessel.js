
import SederHishtalshelusNode from '../../core/SederHishtalshelusNode.js';

/**
 * B"H
 * @file CameraVessel.js
 * 
 * Chapter: The Window to the Infinite.
 * "For my eyes are toward You always."
 * A 2D world is much larger than the screen. The Camera represents the 
 * focal point of the Tzimtzum. It dynamically calculates offsets so that 
 * the HeroSoul remains in the center of the browser window at all times.
 */

/**
 * @class CameraVessel
 * @extends SederHishtalshelusNode
 * @description Calculates X and Y offsets for the rendering context.
 */
export default class CameraVessel extends SederHishtalshelusNode {
    /**
     * @param {number} viewWidth - Screen width.
     * @param {number} viewHeight - Screen height.
     */
    constructor(viewWidth, viewHeight) {
        super({ worldName: "Atzilut_Focus_Point" });
        this.viewWidth = viewWidth;
        this.viewHeight = viewHeight;
        this.offsetX = 0;
        this.offsetY = 0;
    }

    /**
     * @method follow
     * @description Aligns the camera so the target coordinate is in the screen's exact center.
     * @param {Object} targetPos - {x,y} coordinate to follow.
     */
    follow(targetPos) {
        this.offsetX = targetPos.x - (this.viewWidth / 2);
        this.offsetY = targetPos.y - (this.viewHeight / 2);
    }

    /**
     * @method updateDimensions
     * @description Adjusts to window resizing.
     */
    updateDimensions(w, h) {
        this.viewWidth = w;
        this.viewHeight = h;
    }
}
