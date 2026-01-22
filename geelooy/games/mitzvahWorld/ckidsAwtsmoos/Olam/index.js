// B"H
/**
 * The Olam class represents a 3D World or "Scene" in a game.
 * Reverted to Linear Fog and ancestral colors for visibility.
 */

import eventListeners from "./eventListeners/index.js";
import methods from "./methods/index.js";
import init from "./init.js"
import GrassMaterial from "./materials/Grass.js"
import * as THREE from '/games/scripts/build/three.module.js';
import Nivra from "../chayim/nivra.js";
import Ayin from "./camera/index.js";
import UserProgressManager from "../systems/UserProgressManager.js"; 
import Environment from "./methods/environment.js";
import properties from "./methods/properties.js";
import GeminiAdapter from "../ai/GeminiAdapter.js";

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
            const props = new properties();
            Object.assign(this, props);

            methods.bind(this)();
            eventListeners.bind(this)();

            this.ayin = new Ayin(this);
            this.ayin.camera.far = 4828;
            
            // B"H: Reverted to the "Perfect" Linear Fog and Blue Sky from old.md
            const skyColor = new THREE.Color(0x88ccee);
            this.scene.background = skyColor;
            this.scene.fog = new THREE.Fog(skyColor, this.ayin.camera.near, this.ayin.camera.far);
            
            this.nivrayimGroup.name = "nivrayimGroup"
            this.scene.add(this.nivrayimGroup)
            
            this.userProgressManager = new UserProgressManager(this);
            this.environment = new Environment({ scene: this.scene, olam: this });
            
            if(this.startShlichusHandler) {
                 this.startShlichusHandler(this);
            }

            this.scene.add(this.octreeDebugHelper);
            console.log("B\"H - Olam successfully forged in the image of the ancestral perfection.");
        } catch(e) {
            console.error("B\"H - Olam Constructor Error:", e);
            this.ayshPeula("error", {
                code: "constructor_WORLD_PROBLEM",
                details: e.toString(),
                message: "An issue happened in the world constructor."
            })
        }
    }

    /**
     * refineExistence - Invokes the power of Bezalel (AI) to recursively improve the world.
     * @param {number} iterations How many times the light should descend.
     * @param {string} prompt Custom refinement goal.
     */
    async refineExistence(iterations = 1, prompt = "Make this world more beautiful and filled with life.") {
        for (let i = 0; i < iterations; i++) {
            console.log(`B"H - Refinement Iteration ${i+1}/${iterations} Initiated.`);
            
            this.ayshPeula("increase loading percentage", {
                amount: 0, reset: true,
                action: `Refinement Pulse ${i+1}...`,
                subAction: "Consulting the Architect"
            });

            const state = this.getCompiledNivrayimInfo();
            const delta = await GeminiAdapter.refineWorldExistence(state, prompt);

            if (delta) {
                this.ayshPeula("increase loading percentage", {
                    amount: 50, reset: true,
                    action: `Refinement Pulse ${i+1}...`,
                    subAction: "Manifesting New Details"
                });
                await this.loadNivrayim(delta);
            }

            await new Promise(r => setTimeout(r, 500)); // Breath between iterations
        }
        
        this.ayshPeula("ui event", "effectsOverlay", { text: "Creation Refined", color: "#00ffed" });
    }

    get camera() { return this.activeCamera || this.ayin.camera; }
    set pixelRatio(pr) { if(this.renderer) this.renderer.setPixelRatio(pr); }
    async init() { await init(this); }
}
