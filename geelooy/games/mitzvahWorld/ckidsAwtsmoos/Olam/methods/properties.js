
/**
 * B"H
 * 
 * inital properties to set for Olam
 */

import * as THREE from '/games/scripts/build/three.module.js';

import { GLTFLoader } from '/games/scripts/jsm/loaders/GLTFLoader.js';
import {DRACOLoader} from "/games/scripts/jsm/loaders/DRACOLoader.js"

// B"H: Reverted to monolithic file import as requested
import { OctreeWorld as Octree } from '../math/OctreeWorld.js';

//import WebGPURenderer from "/games/scripts/jsm/gpu/WebGPURenderer.js"

// B"H: MANDATORY ENGINE COMPATIBILITY PATCH
// The current engine build requires morphTargetInfluences to be present on all objects.
// Instead of modifying three.module.js, we satisfy the requirement globally here.
if (THREE.Object3D) {
    const EMPTY_INFLUENCES = new Float32Array(8).fill(0);
    Object.defineProperty(THREE.Object3D.prototype, 'morphTargetInfluences', {
        get: function() {
            if (!this._morphTargetInfluences) {
                return EMPTY_INFLUENCES;
            }
            return this._morphTargetInfluences;
        },
        set: function(v) {
            this._morphTargetInfluences = v;
        },
        configurable: true
    });
}

// B"H: Polyfill Image for Web Worker environment so GLTFLoader checks pass
// Enhanced Polyfill to satisfy GLTFLoader requirements
if (typeof self !== 'undefined' && typeof Image === 'undefined') {
    self.Image = class { 
        constructor() {
            this.src = '';
            this.width = 0;
            this.height = 0;
            this.onload = null;
            this.onerror = null;
        }
        addEventListener(type, listener) {
            if (type === 'load') this.onload = listener;
            if (type === 'error') this.onerror = listener;
        }
        removeEventListener() {}
    };
}

export default class {
    loader = new GLTFLoader(); // A GLTFLoader for loading 3D models
    
    cameraObjectDirection = new THREE.Vector3();

    nivrayimGroup = new THREE.Group();
    
    //DOF effect
    coby = 0;
    // constants
    STEPS_PER_FRAME = 5;
    GRAVITY = 30;
    currentLoadingPercentage = 0;
    destroyed = false;
    
    // Camera-related properties
    aynaweem = []; // "Eyes" or cameras for the scene
   
    
    ayinRotation = 0;
    ayinPosition = new THREE.Vector3();
    cameraObjectDirection = new THREE.Vector3();
    usingGPU = false;
    rendererTemplate = canvas => /*navigator.gpu  && this.usingGPU
        ? WebGPURenderer : */
            canvas.getContext("webgl2") ? THREE.WebGLRenderer :
            THREE.WebGL1Renderer;
  
    // Scene-related properties
    scene = new THREE.Scene();
    
    isGPU = () => 
        this.usingGPU
        
       
    // Physics-related properties
    worldOctree = new Octree(); // An octree for efficient collision detection
    interactiveOctree = new Octree();
    
    octreeDebugHelper = new THREE.Box3Helper(new THREE.Box3(), 0xff0000);
  
    
    achbar = new THREE.Vector2() // mouse position
    // Misc properties
    
    clock = new THREE.Clock(); // A clock for tracking time
    
    nivrayimBeforeLoad = [];
    renderer; // A renderer for the scene
    
    deltaTime = 1; // The amount of time that has passed since the last frame

    /**
     * @property components
     * components are raw bytes
     * of data loaded from fines
     */
    components = {};

    vars = {};

    /**
     * @property assets
     * assets are instantiated JavaScript
     * Objects (such as a GLTF instance)
     * loaded from raw byte data (component).
     * 
     * Useful for reusing same resources 
     * (that can be cloned etc.)
     * 
     * 
     * Can also be used for 
     * global (within world)
     * variables.
     */
    assets = {};
    shlichusHandler = null;

    
    inputs = {
        FORWARD: false,
        BACKWARD: false,
        LEFT_ROTATE: false,
        RIGHT_ROTATE: false,
        LEFT_STRIDE: false,
        RIGHT_STRIDE: false,
        JUMP: false,
        RUNNING: true
    };

    keyBindings = {
        "KeyW": "FORWARD",
        "ArrowUp": "FORWARD",
        "ArrowDown": "BACKWARD",
        "ArrowRight":"RIGHT_ROTATE",
        "ArrowLeft": "LEFT_ROTATE",

        "KeyA": "LEFT_ROTATE",
        "KeyD": "RIGHT_ROTATE",

        "KeyS": "BACKWARD",
        "KeyE": "RIGHT_STRIDE",
        "KeyQ": "LEFT_STRIDE",

        "KeyR": "PAN_UP",
        "KeyF": "PAN_DOWN",

        "Space": "JUMP",
        "KeyX": "DOWN",
        "KeyC": "INTERACT"

        //"ShiftLeft": "RUNNING",
        //"ShiftRight": "RUNNING"

    }
    completedShlichuseem = []
    startedShlichuseem = []

    // Input-related properties
    keyStates = {}; // State of key inputs
    mouseDown = false; // State of mouse input
    ohros = []; // Lights for the scene
    enlightened = false;
    minimapCanvas = null;
    minimapRenderer = null;
 
    objectsInScene = []; // Objects in the scene

    // Animation-related properties
    isHeesHawvoos = false; // Flag to indicate if the scene is currently animating
    nivrayim = []; // Objects to be animated
    nivrayimWithShlichuseem = [];

    nivrayimWithDialogue = []
    /**
     * @property {Array} nivrayim 
     * creations that can be interacted with.
     * 
     * Used in Tzomaaych class to check,
     * if proximity is set, which pool
     * of objects to search for for collision
     * detection.
     */
    interactableNivrayim = [];

    nivrayimWithPlaceholders = [];
    nivrayimWithEntities = [];
    meshesToInteractWith = [];
    html = null;


    waterMesh = null;
    
    actions = {
        reset(player, nivra/*that collided with*/, olam) {
            if (player) {
                player.teleporting = true;
                setTimeout(() => {
                    olam.ayshPeula('reset player position')
                    player.teleporting = false
                }, 500)
            }
        }
    }
}
