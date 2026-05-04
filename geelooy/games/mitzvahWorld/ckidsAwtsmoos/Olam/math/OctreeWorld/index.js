
// B"H
/**
 * @module OctreeWorld
 * @description
 * 🏰 THE TEMPLE OF FOUNDATIONS (MODULAR EDITION) 🏰
 * 
 * "With a span He weighed the Earth."
 * We have successfully split the colossal OctreeWorld into a vast network of 
 * modular limbs. Each file manages its own hyper-specific piece of logic, 
 * maintaining pristine clarity and limitless scalability.
 */
import * as THREE from '/games/scripts/build/three.module.js';
import JobProcessor from './JobProcessor.js';
import methods from './methods/index.js';

export class OctreeWorld {
    constructor() {
        this.root = null;
        this._intakeQueue = [];
        this._buildQueue = new Set();
        this._subdivisionQueue = new Set();
        this._mergeQueue = new Set();
        this._pendingOctrees = []; 
        this._lastUpdateCenter = new THREE.Vector3(Infinity, Infinity, Infinity);
        
        this.jobProcessor = new JobProcessor(this);
        
        // B"H: The Grand Seder Hishtalshelus Binding
        // We draw down all modular methods into the context of this specific world!
        Object.keys(methods).forEach(methodName => {
            this[methodName] = methods[methodName].bind(this);
        });
        
        // B"H: silent

    }
}
