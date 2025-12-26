
/**
 * B"H
 * The Olam class represents a 3D World or "Scene" in a game.
 */

import eventListeners from "./eventListeners/index.js";
import methods from "./methods/index.js";
import init from "./init.js"
import GrassMaterial from "./materials/Grass.js"
import * as THREE from '/games/scripts/build/three.module.js';

// B"H: Direct import to break circular dependency
import Nivra from "../chayim/nivra.js";

import Ayin from "./camera/index.js";
import UserProgressManager from "../systems/UserProgressManager.js"; 
import Environment from "./methods/environment.js";

// B"H: Import Properties statically
import properties from "./methods/properties.js";

export default class Olam extends Nivra {
    ASPECT_X = 1920;
    ASPECT_Y = 1080;
    official = "official"
    styled = false;
    GrassMaterial = GrassMaterial;
    _activeCamera = null;

    get activeCamera () { return this._activeCamera; }
    set activeCamera(v) { this._activeCamera = v; this.refreshCameraAspect(); }

    constructor() {
        super();
        try {
            // B"H: Apply properties immediately
            const props = new properties();
            Object.assign(this, props);

            // B"H: Bind methods and listeners
            methods.bind(this)();
            eventListeners.bind(this)();

            this.ayin = new Ayin(this);
            this.ayin.camera.far = 4828;
            
            // Setup Scene basics
            this.scene.background = new THREE.Color(0x88ccee);
            this.nivrayimGroup.name = "nivrayimGroup"
            this.scene.add(this.nivrayimGroup)
            this.scene.fog = new THREE.Fog(0x88ccee, this.ayin.camera.near, this.ayin.camera.far );
            
            // B"H: Initialize Persistence
            this.userProgressManager = new UserProgressManager(this);
            
            // B"H: Initialize Environment
            this.environment = new Environment({ scene: this.scene, olam: this });
            
            if(this.startShlichusHandler) {
                 this.startShlichusHandler(this);
            }

            this.scene.add(this.octreeDebugHelper);
        } catch(e) {
            console.error("B\"H - Olam Constructor Error:", e);
            this.ayshPeula("error", {
                code: "constructor_WORLD_PROBLEM",
                details: e.toString(),
                message: "An issue happened in the constructor of the Olam class."
            })
        }
    }

    get camera() { return this.activeCamera || this.ayin.camera; }
    set pixelRatio(pr) { if(this.renderer) this.renderer.setPixelRatio(pr); }
    async init() { await init(this); }
}
