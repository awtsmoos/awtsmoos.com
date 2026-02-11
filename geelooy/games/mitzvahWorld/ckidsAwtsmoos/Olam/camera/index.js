// B"H
/**
 * Ayin - An enhanced Three.js camera class.
 * Representing the constant Hashgacha (Divine Watch) over existence.
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
        this._target = null;
        this.isFPS = false;
        
        // B"H: Decoupled state - looking from afar.
        this.decoupled = true; 

        this.mouseX = 0; this.mouseY = 0; this.deltaY = 0;
        this.targetHeight = 1;
        this.distance = 5.0;
        this.offsetFromWall = 3.6;
        this.maxDistance = 10000;
        this.minDistance = 0.1;
        this.speedDistance = 5;
        this.xSpeed = 75.0; this.ySpeed = 75.0;
        this.zoomRate = .01;
        this.xDeg = 0.0; this.yDeg = 0.0;
        
        this.userInputTheta = 0;
        this.userInputPhi = 0;
        
        this.currentDistance = this.distance;
        this.desiredDistance = this.distance;
        this.correctedDistance = this.distance;
        this.previousResults = new Map();
        
        this.objectsInScene = []; 
        
        /**
         * B"H: Increased Far Plane and adjusted Near Plane.
         * near: 1.0 reduces depth artifacts.
         * far: 100000 ensures massive terrains aren't clipped into the void.
         */
        this.camera = new THREE.PerspectiveCamera(70, width / height, 1.0, 100000);
        olam.scene.add(this.camera);
        this.camera.rotation.order = 'YXZ';
        
        this.cameraFollower = new THREE.Object3D();
        this.cameraFollower.rotation.order = 'YXZ';
        olam.scene.add(this.cameraFollower);

        this.raycaster = new THREE.Raycaster();
        this.mouseRaycaster = new THREE.Raycaster();
        
        this.update = update.bind(this);
        Object.assign(this, controls);
        Object.assign(this, collision);

        console.log("B\"H [Ayin] The Eye of the World is manifest with Infinite Vision (Far: 100k).");
    }

    get target() { return this._target; }
    set target(v) {
        if (!v) {
            this._target = null;
            return;
        }
        if (!v.mesh) {
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
