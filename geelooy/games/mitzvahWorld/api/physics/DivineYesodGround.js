
// B"H
/**
 * @module DivineYesodGround
 * @description
 * * Chapter 4: The Foundation of Reality
 * "The Player fell into the abyss!" The logs cried out in despair!
 * For gravity pulled them downward, with nothing but empty air!
 * We must establish Yesod, the Foundation of the Tree of Life,
 * To give the physical bodies a floor, and end this falling strife!
 * * This class uses pure JSON data to generate a static physics body,
 * Ensuring the Golem (Player) can stand firmly upon the digital sod.
 */
const CANNON = require('cannon-es'); // Assuming Cannon.js for physics

class DivineYesodGround {
    /**
     * @constructor
     * @param {CANNON.World} physicsWorld The realm of judgment (gravity and collision).
     */
    constructor(physicsWorld) {
        this.world = physicsWorld;
        
        /**
         * @property {Object} groundData The immutable JSON blueprint of the earth.
         */
        this.groundData = {
            mass: 0, // Mass of 0 makes it static (unmovable, like the eternal Word)
            shape: {
                type: 'Plane',
                dimensions: [] // Infinite plane doesn't need specific width/height in Cannon
            },
            material: {
                friction: 0.5,
                restitution: 0.1
            },
            quaternion: {
                axis: [1, 0, 0],
                angle: -Math.PI / 2 // Rotate to lay flat on the XZ axis
            }
        };

        this.manifestGround();
    }

    /**
     * @method manifestGround
     * @description
     * Translates the JSON data into a physical CANNON.Body.
     * Prevents the infinite abyss error!
     */
    manifestGround() {
        if (!this.world) return;

        const groundShape = new CANNON.Plane();
        const groundMaterial = new CANNON.Material('yesodMaterial');
        groundMaterial.friction = this.groundData.material.friction;
        groundMaterial.restitution = this.groundData.material.restitution;

        const groundBody = new CANNON.Body({
            mass: this.groundData.mass,
            shape: groundShape,
            material: groundMaterial
        });

        // Rotate the plane to face upwards
        groundBody.quaternion.setFromAxisAngle(
            new CANNON.Vec3(...this.groundData.quaternion.axis), 
            this.groundData.quaternion.angle
        );

        this.world.addBody(groundBody);
        console.log("B\"H - 🌍 Divine Yesod Ground Manifested. The Abyss is sealed.");
    }
}

module.exports = DivineYesodGround;
