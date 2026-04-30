
/**
 * B"H
 * @module Ayin
 * @description
 * 
 * THE PERCEIVING EYE
 * 
 * Chapter 3: The Witness of Form
 * The Ayin is the camera through which the soul gazes upon the Mitzvah World.
 * Updated to support 1:1 screen resolution, removing 'inverted' controls 
 * and ensuring high-stability FOV during rapid window resizing.
 * 
 * TIKKUN OF THE WHEEL:
 * The zoomRate has been drastically reduced from 0.012 to 0.002.
 * The gaze of the eye will now slide smoothly toward and away from the vessel,
 * rather than snapping violently.
 */
import * as THREE from '/games/scripts/build/three.module.js';
import update from "./methods/update/index.js";
import controls from "./methods/controls.js";
import collision from "./methods/collision.js";

 export default class Ayin {
    constructor(olam) {
        // Initial defaults, to be overwritten by the first resize decree
        var width = 1920, height = 1080; 
        this.olam = olam;
        this.width = width;
        this.height = height;
        this.target = null;
        this.isFPS = false;

        this.mouseX = 0;
        this.mouseY = 0;
        this.deltaY = 0;

        this.targetHeight = 1.5;
        this.anchorOffset = new THREE.Vector3(0, 0, 0);

        this.distance = 5.0;
        this.offsetFromWall = 0.5;

        this.maxDistance = 60;
        this.minDistance = 0.1;
        this.speedDistance = 5;

        // Control Intensity
        this.xSpeed = 120.0;
        this.ySpeed = 120.0;
        this.sensitivity = 0.0012;

        // B"H: The Rectification of the Zoom! A gentle approach.
        this.zoomRate = 0.002;
        this.zoomDampening = 5.0;

        this.yMinLimit = -40;
        this.yMaxLimit = 85;

        this.currentDistance = this.distance;
        this.desiredDistance = this.distance;
        this.correctedDistance = this.distance;
        this.previousResults = new Map(); 

        this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 10000);
        this.cameraFollower = this.camera.clone();
        olam.scene.add(this.camera);
        
        // Standard orientation for FPS/ThirdPerson hybrid control
        this.camera.rotation.order = 'YXZ';
        this.group = new THREE.Group();
        this.camera.add(this.group);

        this.raycaster = new THREE.Raycaster();
        this.mouseRaycaster = new THREE.Raycaster();
        this.playerCollisionBuffer = 0.85;
        this.objectsInScene =[];

        this.userInputTheta = 0;
        this.userInputPhi = 0;
        this.mouseIsDown = false;
        this.lastDistance = null;
        this.panAmount = 0.5;
        
        // B"H: Dynamic Binding
        this.update = update.bind(this);
        Object.keys(controls).forEach(q => { this[q] = controls[q].bind(this); });
        Object.keys(collision).forEach(q => { this[q] = collision[q].bind(this); });
    }

    get target() { return this._target; }
    set target(v) {
        this._target = v;
        if(v && typeof v.height === "number") {
             this.targetHeight = v.height;
        }
    }

    /**
     * @function setSize
     * @description Recalculates the lens based on new physical boundaries.
     */
    setSize(width, height) {
        this.width = width;
        this.height = height;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        
        if (this.cameraFollower) {
            this.cameraFollower.aspect = this.camera.aspect;
            this.cameraFollower.updateProjectionMatrix();
        }
    }

    clampAngle(angle, min, max) {
        if (angle < -360) angle += 360;
        if (angle > 360) angle -= 360;
        return Math.max(Math.min(angle, max), min);
    }
}
