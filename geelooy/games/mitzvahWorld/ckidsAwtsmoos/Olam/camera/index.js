
/**
 * B"H
 * @module Ayin
 * @description
 * 👁️ THE PERCEIVING EYE 👁️
 * 
 * Chapter 3: The Witness of Form
 * 
 * TIKKUN OF THE HORIZON:
 * The village grounds are 1000+ units wide. If the 'far' plane is too close, 
 * the earth vanishes. We have expanded the gaze to 10,000 units.
 */
import * as THREE from '/games/scripts/build/three.module.js';
import update from "./methods/update/index.js";
import controls from "./methods/controls.js";
import collision from "./methods/collision.js";

 export default class Ayin {
    constructor(olam) {
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

        this.distance = 15.0; // B"H: Start further back to see the world
        this.offsetFromWall = 0.5;

        this.maxDistance = 500;
        this.minDistance = 0.5;
        this.speedDistance = 5;

        this.xSpeed = 120.0;
        this.ySpeed = 120.0;
        this.sensitivity = 0.0012;

        this.zoomRate = 0.005;
        this.zoomDampening = 5.0;

        this.yMinLimit = -40;
        this.yMaxLimit = 85;

        this.currentDistance = this.distance;
        this.desiredDistance = this.distance;
        this.correctedDistance = this.distance;
        this.previousResults = new Map(); 

        // B"H: FAR PLANE EXPANSION
        // We set the far plane to 10,000 to ensure the ground is never culled.
        this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 10000);
        this.cameraFollower = this.camera.clone();
        olam.scene.add(this.camera);
        
        this.camera.rotation.order = 'YXZ';
        this.group = new THREE.Group();
        this.camera.add(this.group);

        this.raycaster = new THREE.Raycaster();
        this.mouseRaycaster = new THREE.Raycaster();
        this.playerCollisionBuffer = 0.85;
        this.objectsInScene =[];

        this.userInputTheta = 0;
        this.userInputPhi = 20; // Look down slightly at start
        this.mouseIsDown = false;
        
        this.update = update.bind(this);
        Object.keys(controls).forEach(q => { this[q] = controls[q].bind(this); });
        Object.keys(collision).forEach(q => { this[q] = collision[q].bind(this); });

        // B"H: silent

    }

    setSize(width, height) {
        // B"H: silent

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
