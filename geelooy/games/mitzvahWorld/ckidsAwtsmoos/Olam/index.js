
/**
 * B"H
 * The Olam class represents a 3D World or "Scene" in a game.
 */

// Static Core Dependencies
import * as THREE from '/games/scripts/build/three.module.js';
import * as AWTSMOOS from '../awtsmoosCkidsGames.js';
import Ayin from "./camera/index.js";
import UserProgressManager from "../systems/UserProgressManager.js"; 
import Environment from "./methods/environment.js";
import GrassMaterial from "./materials/Grass.js"

// B"H: Import Properties statically to ensure constructor has 'scene', 'renderer', etc.
import properties from "./methods/properties.js";

export default class Olam extends AWTSMOOS.Nivra {
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
            // B"H: Apply properties immediately so 'this.scene' exists
            const props = new properties();
            Object.assign(this, props);

            // B"H: Initialize Ayin (Camera) which needs 'this.scene'
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

            // Note: shlichusHandler will be started in init() after methods are loaded
            // this.startShlichusHandler(this); 
            
            this.scene.add(this.octreeDebugHelper);
        } catch(e) {
            console.error("B\"H - Olam Constructor Error:", e);
        }
    }

    get camera() { return this.activeCamera || this.ayin.camera; }
    set pixelRatio(pr) { if(this.renderer) this.renderer.setPixelRatio(pr); }
    
    /**
     * B"H
     * Robust Initialization: Dynamically imports logic modules.
     * This isolates syntax errors in methods/listeners from crashing the entire worker.
     */
    async init() { 
        console.log("B\"H - Olam.init() starting dynamic module load...");
        try {
            // 1. Load Init Helper
            const initFn = await import("./init.js");
            
            // 2. Load Methods (Logic)
            const methodsModule = await import("./methods/index.js");
            // Bind methods to this instance
            await methodsModule.default.bind(this)();

            // 3. Load Event Listeners
            const listenersModule = await import("./eventListeners/index.js");
            listenersModule.default.bind(this)();

            // 4. Initialize Systems that rely on methods
            this.startShlichusHandler(); // Now safe to call
            
            // 5. Run Init
            await initFn.default(this);
            
            console.log("B\"H - Olam logic modules loaded successfully.");
        } catch(e) {
            console.error("B\"H - CRITICAL: Failed to load Olam logic modules!", e);
            this.ayshPeula("error", {
                code: "MODULE_LOAD_FAIL",
                details: e.toString(),
                message: "A syntax error in game logic prevented startup. Check console."
            });
            throw e; // Rethrow to stop tzimtzum
        }
    }
}
