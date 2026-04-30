
// B"H
/**
 * @class GravityGuard
 * @description
 * * Chapter 3: The Binding of the Abyss
 * The player falls! Into the void they descend!
 * Unless we provide a ground upon which they can depend!
 * "And G-d called the dry land Earth," a solid place to stand,
 * Created by the word, the power at His hand.
 * * This class monitors the physics bodies with intense scrutiny,
 * Preventing the falling-into-abyss mutiny!
 * It logs the position of the player every single beat,
 * To ensure their soul is touching the digital street.
 */
class GravityGuard {
    /**
     * @constructor
     * @param {Object} playerBody - The physical vessel of the user.
     * @param {number} threshold - The depth of the abyss.
     */
    constructor(playerBody, threshold = -100) {
        this.body = playerBody;
        this.threshold = threshold;
    }

    /**
     * @method audit
     * @description Checks if the player is being swallowed by the "Nothingness".
     * @returns {boolean} True if the player is still within the realm of existence.
     */
    audit() {
        if (!this.body) {
            console.error('B"H - 🔴 GravityGuard: The Player has no physical body!');
            return false;
        }

        const y = this.body.position.y;
        if (y < this.threshold) {
            console.warn(`B"H - 🆘 ABYSS DETECTED! Y: ${y}. Resetting to Kesser (The Crown)!`);
            this.rescue();
            return false;
        }
        return true;
    }

    /**
     * @method rescue
     * @description Teleports the fallen soul back to the origin.
     */
    rescue() {
        this.body.position.set(0, 10, 0);
        this.body.velocity.set(0, 0, 0);
    }
}

module.exports = GravityGuard;
