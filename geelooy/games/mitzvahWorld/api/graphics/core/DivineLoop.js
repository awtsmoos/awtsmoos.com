
// B"H
/**
 * @class DivineLoop
 * @description
 * * A loop that never ceases, a river of time,
 * A reflection of the Infinite, majestic, sublime!
 * This is the engine of constant recreation,
 * The very pulse of the entire digital creation!
 * * Every call to requestAnimationFrame is a new plea,
 * "Please, Awtsmoos, let the pixels continue to be!"
 * And He answers with a burst of rendering light,
 * Calculating the delta, making the animations bright!
 * * If this loop were to pause, if the thread were to break,
 * It would be as if nothing existed, no form could it take!
 * Not just a freeze, but an absolute cessation,
 * A return to the void before the First Emanation!
 */
const THREE = require('three');

class DivineLoop {
    /**
     * @constructor
     * @param {Object} dependencies The required vessels for the loop.
     * @param {Object} dependencies.renderer The RendererVessel instance.
     * @param {THREE.Scene} dependencies.scene The universe to render.
     * @param {THREE.Camera} dependencies.camera The perspective to render from.
     */
    constructor({ renderer, scene, camera }) {
        this.renderer = renderer;
        this.scene = scene;
        this.camera = camera;
        
        this.clock = new THREE.Clock();
        this.updatables = new Set(); // Using a Set to store all animated entities (data-driven)
        this.isRunning = false;
        
        // Bind the context infinitely
        this.tick = this.tick.bind(this);
    }

    /**
     * @method addUpdatable
     * @description
     * Registers an entity (like the BreathOfLifeMixer) to receive
     * the constant flow of time (delta) every frame.
     * * @param {Object} entity An object with an `update(delta)` method.
     */
    addUpdatable(entity) {
        if (entity && typeof entity.update === 'function') {
            this.updatables.add(entity);
        }
    }

    /**
     * @method start
     * @description
     * Begins the infinite sequence of recreation from nothingness.
     */
    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.clock.start();
        this.renderer.instance.setAnimationLoop(this.tick);
    }

    /**
     * @method stop
     * @description
     * Halts the Divine flow. The universe goes dark.
     */
    stop() {
        this.isRunning = false;
        this.clock.stop();
        this.renderer.instance.setAnimationLoop(null);
    }

    /**
     * @method tick
     * @private
     * @description
     * The heartbeat. Calculates the slice of time, updates all physical
     * and animated manifestations, and renders the frame.
     */
    tick() {
        if (!this.isRunning) return;

        // Measure the distance between the last creation and this one
        const delta = this.clock.getDelta();

        // Pour the life-force into every registered vessel
        for (const entity of this.updatables) {
            entity.update(delta);
        }

        // Render the physical proof of existence
        this.renderer.render(this.scene, this.camera);
    }
}

module.exports = DivineLoop;
