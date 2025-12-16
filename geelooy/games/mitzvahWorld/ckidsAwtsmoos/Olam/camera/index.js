
//B"H
/**
 * Ayin - An enhanced Three.js camera class that follows a target object in the scene. 
 * Provides functionalities for rotating around the target, zooming in/out, 
 * and collision avoidance with scene objects.
 */
import * as THREE from '/games/scripts/build/three.module.js';
import update from "./methods/update.js";
import controls from "./methods/controls.js";
import collision from "./methods/collision.js";
 export default class Ayin {
    constructor(olam) {
        var width = 1920, height = 1080; // B"H: Default dimensions to avoid NaN
        this.olam = olam;
        this.width = width;
        this.height = height;
        this.target = null;
        this.isFPS = false;

        this.mouseX = 0;
        this.mouseY = 0;
        this.deltaY = 0;

        this.targetHeight = 1;

        this.amountToStartHidingTarget = 1.52
        this.amountToHideTargetCompletely = 1.508
        

        this.distance = 5.0;
        this.offsetFromWall = 3.6

        this.maxDistance = 20;
        this.minDistance = 0.1;
        this.speedDistance = 5;

        this.xSpeed = 75.0;
        this.ySpeed = 75.0;

        this.yMinLimit = -40;
        this.yMaxLimit = 80;

        this.movedRotation = null;

        this.zoomRate = .01;

        this.rotationDampening = 3.0;
        this.zoomDampening = 5.0;

        this.xDeg = 0.0;
        this.yDeg = 0.0;
        this.currentDistance = this.distance;
        this.desiredDistance = this.distance;
        this.correctedDistance = this.distance;
        this.previousResults = new Map(); // Cache for storing previous results

        
        this.camera = new THREE.PerspectiveCamera(70, width / height, 0.1, 1000);
        this.cameraFollower = this.camera.clone();
        olam.scene.add(this.camera);
        this.camera.rotation.order = 'YXZ';
        this.group = new THREE.Group();
        this.camera.add(this.group);

        this.raycaster = new THREE.Raycaster();

        this.mouseRaycaster = new THREE.Raycaster();
        
         this.playerCollisionBuffer = 0.770;


        this.objectsInScene = [];

        this.userInputTheta = 0;
        this.userInputPhi = 0;
     
        this.mouseIsDown = false;

        this.lastDistance = null;

        this.panAmount = 0.5;
        this.modelMesh = null;
        
        this.update = update.bind(this);
        
        Object.keys(controls).forEach(q => {
	        this[q] = controls[q].bind(this);
        });
        Object.keys(collision).forEach(q => {
	        this[q] = collision[q].bind(this);
        });
    }

    get target() {
        return this._target;
    }

    set target(v) {
        this._target = v;
        if(v?.collider) {
	       /* this.targetHeight = 
	        (v.collider.end.y - 
	        v.collider.start.y)*/
        }
        if(v && typeof(v.height) == "number") {
             this.targetHeight = v.height;
        }
    }

    setSize(width, height) {
        this.width = width;
        this.height = height;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    }

    

    clampAngle(angle, min, max) {
        if (angle < -360)
            angle += 360;
        if (angle > 360)
            angle -= 360;
        return Math.max(Math.min(angle, max), min);
    }
    
    sensitivity = 0.001;

    sentToOlam = false;
    
    _lastFocalDepth;
    

    newMovement=false
    
    

}
