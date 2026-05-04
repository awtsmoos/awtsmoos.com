
/**
 * B"H
 * @file index.js (Olam)
 * @description The master world vessel, overseer of all 3D emanations.
 */

import assembleFaculties from "./methods/index.js";
import init from "./init.js";
import GrassMaterial from "./materials/Grass.js";
import * as THREE from '/games/scripts/build/three.module.js';
import * as AWTSMOOS from '../awtsmoosCkidsGames.js';
import Ayin from "./camera/index.js";
import UserProgressManager from "../systems/UserProgressManager.js"; 
import Yichud from "./interaction/Yichud.js";
import PlacementManager from "./interaction/PlacementManager.js";

export default class Olam extends AWTSMOOS.Nivra {
    ASPECT_X = 1920;
    ASPECT_Y = 1080;
    official = "official";
    styled = false;
    GrassMaterial = GrassMaterial;
    _activeCamera = null;

    get activeCamera() { return this._activeCamera; }
    set activeCamera(v) { this._activeCamera = v; this.refreshCameraAspect(); }

    constructor() {
        super();
        this._facultiesGrafted = assembleFaculties.call(this);

        this._facultiesGrafted.then(() => {
            try {
                // B"H: Bind the Octree to the world so it can spawn diagnostic helpers!
                this.worldOctree.olam = this;
                this.interactiveOctree.olam = this;

                this.ayin = new Ayin(this);
                this.ayin.camera.far = 4828;
                this.scene.background = new THREE.Color(0x88ccee);
                this.nivrayimGroup.name = "nivrayimGroup";
                this.scene.add(this.nivrayimGroup);
                this.scene.fog = new THREE.Fog(0x88ccee, this.ayin.camera.near, this.ayin.camera.far);
                
                this.userProgressManager = new UserProgressManager(this);
                this.yichud = new Yichud(this);
                this.placementManager = new PlacementManager(this);
                this.startShlichusHandler(this);
                this.scene.add(this.octreeDebugHelper);
                
                // B"H: silent

            } catch (e) {
                console.error("B\"H - 🚨 Olam constructor internal setup shattered:", e);
            }
        }).catch(e => {
             console.error("B\"H - 🚨 Faculty grafting failed entirely:", e);
        });
    }

    get camera() { return this.activeCamera || this.ayin.camera; }
    set pixelRatio(pr) { if(this.renderer) this.renderer.setPixelRatio(pr); }

    async init() { 
        // B"H: silent

        await this._facultiesGrafted; 
        // B"H: silent

        await init(this); 
    }
}
