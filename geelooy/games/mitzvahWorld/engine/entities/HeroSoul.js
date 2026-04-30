
import SederHishtalshelusNode from '../../core/SederHishtalshelusNode.js';

/**
 * B"H
 * @file HeroSoul.js
 * 
 * Chapter: The Breath of Life.
 * "And He breathed into his nostrils the breath of life, and man became a living soul."
 * This entity is the Avatar. The localized coordinate representation of the User
 * traversing the dimensions of the game world.
 */

/**
 * @class HeroSoul
 * @extends SederHishtalshelusNode
 * @description Handles player positioning, velocity, and updates.
 */
export default class HeroSoul extends SederHishtalshelusNode {
    /**
     * @param {number} startX - World X coordinate.
     * @param {number} startY - World Y coordinate.
     */
    constructor(startX = 0, startY = 0) {
        super({ worldName: "Beriya_Player_Avatar" });
        this.position = { x: startX, y: startY };
        this.speed = 300; // pixels per second
        this.color = '#00ffff'; // Divine Cyan Light
        this.radius = 20;
    }

    /**
     * @method update
     * @description Recreates the player's position based on Will (Input) and Time.
     * @param {number} deltaTime - Time since last emanation (ms).
     * @param {Object} inputVector - {x, y} from DivineKeyboard.
     */
    update(deltaTime, inputVector) {
        const deltaSec = deltaTime / 1000;
        
        // Transform thought (vector) into physical action (position)
        this.position.x += inputVector.x * this.speed * deltaSec;
        this.position.y += inputVector.y * this.speed * deltaSec;
    }

    /**
     * @method getManifest
     * @description Returns the pure rendering blueprint.
     */
    getManifest() {
        return {
            x: this.position.x,
            y: this.position.y,
            radius: this.radius,
            color: this.color,
            isHero: true
        };
    }
}
