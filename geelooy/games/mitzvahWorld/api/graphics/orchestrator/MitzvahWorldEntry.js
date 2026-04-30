
// B"H
/**
 * @class MitzvahWorldEntry
 * @description
 * * The Grand Assembler! The Seder Hishtalshelus manifest!
 * Where the components are gathered to be eternally blessed.
 * This file binds the renderer, the loop, and the mesh,
 * Breathing the Divine soul into the digital flesh!
 * * It takes the chaotic errors and pixelated despair,
 * And applies the data-driven systems with ultimate care.
 * Using Maps and Objects, no 'switch' statements allowed,
 * Making the Awtsmoos proud, shouting out loud!
 * * From the highest Kesser down to the earthly Malchus plane,
 * The game will load smoothly, free from error and pain!
 */
const THREE = require('three');
const RendererVessel = require('../core/RendererVessel.js');
const BreathOfLifeMixer = require('../animation/BreathOfLifeMixer.js');
const DivineLoop = require('../core/DivineLoop.js');

class MitzvahWorldEntry {
    /**
     * @constructor
     * @param {HTMLElement} container The earthly vessel (div) to hold the world.
     */
    constructor(container) {
        this.container = container;
        
        // 1. Creation of the dimensions (Scene and Camera)
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 2, 5);

        // 2. Instantiating the Vessel (Renderer fixing pixelation)
        this.renderer = new RendererVessel({ container: this.container });

        // 3. Establishing the Divine Loop (Recreation from nothing)
        this.loop = new DivineLoop({
            renderer: this.renderer,
            scene: this.scene,
            camera: this.camera
        });

        // 4. A map to hold all loaded vessels (Data-driven!)
        this.spiritualEntities = new Map();
    }

    /**
     * @method handleGLBLoad
     * @description
     * The callback when the GLTFLoader successfully retrieves a mesh.
     * Extracts the raw data, creates the mixer, and injects it into the Loop!
     * * @param {Object} gltf The loaded payload containing scene and animations.
     * @param {string} entityId A unique identifier for the data map.
     */
    handleGLBLoad(gltf, entityId) {
        const model = gltf.scene;
        this.scene.add(model);

        // Extract the breath (animations)
        const animator = new BreathOfLifeMixer({
            root: model,
            animations: gltf.animations
        });

        // Register the entity in the Seder Hishtalshelus Map
        this.spiritualEntities.set(entityId, {
            mesh: model,
            animator: animator
        });

        // Feed the animator into the eternal loop!
        this.loop.addUpdatable(animator);
        
        // Start the first breath
        if (gltf.animations.length > 0) {
             // Assuming the first animation is the idle/default state
            animator.playAction(gltf.animations[0].name);
        }
    }

    /**
     * @method ignite
     * @description
     * Calls forth the light. Starts the loop. Let there be existence!
     */
    ignite() {
        this.loop.start();
        console.log("B\"H - Mitzvah World Ignited! The Awtsmoos is revealed!");
    }
}

module.exports = MitzvahWorldEntry;
