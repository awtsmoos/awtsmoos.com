
// B"H
/**
 * Ayin - An enhanced Three.js camera class.
 * Hardened against NaN targets during world load.
 */
import * as THREE from '/games/scripts/build/three.module.js';
import update from "./methods/update.js";
import controls from "./methods/controls.js";
import collision from "./methods/collision.js";

export default class Ayin {
    constructor(olam) {
        var width = 1920, height = 1080;
        this.olam = olam;
        this.width = width; this.height = height;
        this.target = null;
        this.isFPS = false;
        this.mouseX = 0; this.mouseY = 0; this.deltaY = 0;
        this.targetHeight = 1;
        this.distance = 5.0;
        this.offsetFromWall = 3.6;
        this.maxDistance = 20; this.minDistance = 0.1;
        this.xSpeed = 75.0; this.ySpeed = 75.0;
        this.zoomRate = .01;
        this.xDeg = 0.0; this.yDeg = 0.0;
        
        // B"H: Initialize inputs to 0 to prevent NaN propagation
        this.userInputTheta = 0;
        this.userInputPhi = 0;
        
        this.currentDistance = this.distance;
        this.desiredDistance = this.distance;
        this.correctedDistance = this.distance;
        this.previousResults = new Map();
        
        this.objectsInScene = []; // B"H: Initialize list to prevent crash
        
        this.camera = new THREE.PerspectiveCamera(70, width / height, 0.1, 2000);
        olam.scene.add(this.camera);
        this.camera.rotation.order = 'YXZ';
        
        this.raycaster = new THREE.Raycaster();
        this.mouseRaycaster = new THREE.Raycaster();
        
        this.update = update.bind(this);
        Object.assign(this, controls);
        Object.assign(this, collision);
    }

    get target() { return this._target; }
    set target(v) {
        // B"H: Extreme Guard
        if (!v || !v.mesh || isNaN(v.mesh.position.x)) {
            this._target = null;
            return;
        }
        this._target = v;
        if (typeof(v.height) == "number") this.targetHeight = v.height;
    }

    setSize(width, height) {
        if (isNaN(width) || isNaN(height) || height === 0) return;
        this.width = width; this.height = height;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    }
}
