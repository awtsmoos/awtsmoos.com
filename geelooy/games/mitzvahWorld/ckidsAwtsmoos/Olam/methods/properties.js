
/**
 * B"H
 * 
 * inital properties to set for Olam
 */

import * as THREE from '/games/scripts/build/three.module.js';

import { GLTFLoader } from '/games/scripts/jsm/loaders/GLTFLoader.js';
import {DRACOLoader} from "/games/scripts/jsm/loaders/DRACOLoader.js"

// B"H: Update to point to the index file of the directory
import { OctreeWorld as Octree } from '../math/OctreeWorld/index.js';

// B"H: Polyfill Image for Web Worker environment so GLTFLoader checks pass
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
    loader = new GLTFLoader(); 
    
    cameraObjectDirection = new THREE.Vector3();

    nivrayimGroup = new THREE.Group();
    
    coby = 0;
    STEPS_PER_FRAME = 5;
    GRAVITY = 30;
    currentLoadingPercentage = 0;
    destroyed = false;
    
    aynaweem = []; 
   
    ayinRotation = 0;
    ayinPosition = new THREE.Vector3();
    cameraObjectDirection = new THREE.Vector3();
    usingGPU = false;
    
    // B"H: FIX - Removed manual context check. 
    // THREE.WebGLRenderer correctly handles both standard Canvas and OffscreenCanvas automatically.
    // Explicitly checking getContext("webgl2") on an OffscreenCanvas locks it, 
    // causing the subsequent Renderer creation to fail if it tries to set attributes (like antialias).
    rendererTemplate = () => THREE.WebGLRenderer;
  
    scene = new THREE.Scene();
    
    isGPU = () => this.usingGPU;
       
    worldOctree = new Octree(); 
    interactiveOctree = new Octree();
    
    octreeDebugHelper = new THREE.Box3Helper(new THREE.Box3(), 0xff0000);
  
    achbar = new THREE.Vector2();
    
    clock = new THREE.Clock(); 
    
    nivrayimBeforeLoad = [];
    renderer; 
    
    deltaTime = 1; 

    components = {};
    componentSourceUrls = {};

    vars = {};

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
        "keyC": "UP"
    };

    completedShlichuseem = [];
    startedShlichuseem = [];

    keyStates = {}; 
    mouseDown = false; 
    ohros = []; 
    enlightened = false;
    minimapCanvas = null;
    minimapRenderer = null;
 
    objectsInScene = []; 

    isHeesHawvoos = false; 
    nivrayim = []; 
    nivrayimWithShlichuseem = [];

    nivrayimWithDialogue = [];
    
    interactableNivrayim = [];

    nivrayimWithPlaceholders = [];
    nivrayimWithEntities = [];
    meshesToInteractWith = [];
    html = null;

    waterMesh = null;
    
    actions = {
        reset(player, nivra, olam) {
           if(!player.teleporting) {
            player.teleporting = true;
            setTimeout(() => {
                olam.ayshPeula('reset player position')
                player.teleporting = false
            }, 500)
           }
        }
    }
}
