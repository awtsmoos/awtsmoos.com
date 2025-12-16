
/**
 * B"H
 * The Olam class represents a 3D World or "Scene" in a game.
 */

import eventListeners from "./eventListeners/index.js";
import methods from "./methods/index.js";
import init from "./init.js"
import GrassMaterial from "./materials/Grass.js"
import * as THREE from '/games/scripts/build/three.module.js';
import * as AWTSMOOS from '../awtsmoosCkidsGames.js';
// B"H: Reverted to monolithic ckidsCamera.js as requested
import Ayin from "./camera/index.js";

import UserProgressManager from "../systems/UserProgressManager.js"; 

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
            methods.bind(this)();
            eventListeners.bind(this)();

            this.ayin = new Ayin(this);
            this.ayin.camera.far = 4828;
            this.scene.background = new THREE.Color(0x88ccee);
            this.nivrayimGroup.name = "nivrayimGroup"
            this.scene.add(this.nivrayimGroup)
            this.scene.fog = new THREE.Fog(0x88ccee, this.ayin.camera.near, this.ayin.camera.far );
            
            // B"H: Initialize Persistence
            this.userProgressManager = new UserProgressManager(this);
            
            this.startShlichusHandler(this);
            this.scene.add(this.octreeDebugHelper);
        } catch(e) {
            console.log("Error",e)
            this.ayshPeula("error", {
                code: "constructor_WORLD_PROBLEM",
                details: e,
                message: "An issue happened in the constructor of the Olam class."
            })
        }
    }

    get camera() { return this.activeCamera || this.ayin.camera; }
    set pixelRatio(pr) { if(this.renderer) this.renderer.setPixelRatio(pr); }
    async init() { await init(this); }
}
