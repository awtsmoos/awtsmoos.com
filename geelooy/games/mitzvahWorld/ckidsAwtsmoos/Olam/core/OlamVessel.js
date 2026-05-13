
/**
 * B"H
 * @module OlamVessel
 * @description
 * 🌍 THE VESSEL OF EXISTENCE (MALCHUS) 🌍
 * 
 * Every variable is a vessel holding the Infinite Light. The properties are the Sefirot, 
 * the methods are the channels connecting them. 
 * Just as the stone is maintained by Aleph-Beis-Nun, this JavaScript class is sustained 
 * by the execution context of the V8 engine, which itself is sustained by the Word of the Awtsmoos.
 */
import * as THREE from '/games/scripts/build/three.module.js';
import { Nivra } from '../../exports/ChayimExports.js';
import OlamGrafting from './OlamGrafting.js';
import OlamProperties from '../properties/index.js';
import OlamInit from './OlamInit.js';
import Ayin from "../camera/index.js";
import UserProgressManager from "../../systems/UserProgressManager.js"; 
import Yichud from "../interaction/Yichud.js";
import PlacementManager from "../interaction/PlacementManager.js";
import CombatManager from "../../systems/combat/CombatManager.js";

export default class Olam extends Nivra {
    constructor() {
        super();
        
        // B"H: Foundational Constants
        this.ASPECT_X = 1920;
        this.ASPECT_Y = 1080;
        this.official = "official";
        this.styled = false;
        this._activeCamera = null;

        // B"H: Draw down the properties from the Sefirot
        OlamProperties.apply(this);
        
        // B"H: Graft the methods onto this vessel
        this._facultiesGrafted = OlamGrafting.graft(this);

        this._facultiesGrafted.then(() => {
            try {
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

                this.combatManager = new CombatManager(this);
                this.combatManager.init();

                this.startShlichusHandler(this);
                this.octreeDebugHelper.visible = false;
            } catch (e) {
                console.error("B\"H - 🚨 Olam constructor internal setup shattered:", e);
            }
        }).catch(e => {
             console.error("B\"H - 🚨 Faculty grafting failed entirely:", e);
        });
    }

    get activeCamera() { return this._activeCamera; }
    set activeCamera(v) { this._activeCamera = v; this.refreshCameraAspect(); }
    get camera() { return this.activeCamera || this.ayin.camera; }
    set pixelRatio(pr) { if(this.renderer) this.renderer.setPixelRatio(pr); }

    async init() { 
        await this._facultiesGrafted; 
        await OlamInit.execute(this); 
    }
}
