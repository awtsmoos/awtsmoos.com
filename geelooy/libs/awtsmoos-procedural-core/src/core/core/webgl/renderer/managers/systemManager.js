
// B"H
import { ShadowSystem } from '../shadows.js';
import { SkySystem } from '../passes/skyPass.js';
import { FlareRenderer } from '../passes/flare/flareRenderer.js';
import { ClothSystem } from '../../../physics/clothSystem.js';
import { RigidBodySystem } from '../../../physics/rigidBodySystem.js';
import { MetaballSystem } from '../../../physics/metaballSystem.js';
import { TextureManager } from './textureManager.js';
import { PostProcessingSystem } from '../../postProcessing/index.js';
import { ShapeKeySystem } from '../../../animation/shapeKeySystem.js';
import { LiveCSGSystem } from '../../../physics/live/liveCSGSystem.js';
import { GizmoSystem } from '../../../input/transform/gizmoSystem.js';

export class SystemManager {
    constructor(renderer) {
        this.renderer = renderer;
        this.gl = renderer.gl;
        
        this.shadowSystem = null;
        this.skySystem = null;
        this.flareSystem = null;
        this.postProcessingSystem = null;
        this.textureManager = null;
        this.clothSystem = null;
        this.rigidBodySystem = null;
        this.metaballSystem = null;
        this.shapeKeySystem = null; 
        this.liveCSGSystem = null;
        this.gizmoSystem = null; // B"H - The Chariot of Translation
    }

    init() {
        this.shadowSystem = new ShadowSystem(this.gl);
        this.skySystem = new SkySystem(this.gl);
        this.skySystem.init();
        
        this.flareSystem = new FlareRenderer(this.gl);
        this.flareSystem.init(this.renderer);

        this.postProcessingSystem = new PostProcessingSystem(this.gl);
        this.postProcessingSystem.init();

        this.textureManager = new TextureManager(this.gl);
        this.textureManager.generateCoreTextures();
        
        this.clothSystem = new ClothSystem();
        this.rigidBodySystem = new RigidBodySystem();
        this.metaballSystem = new MetaballSystem();
        
        this.shapeKeySystem = new ShapeKeySystem(this.renderer);
        
        this.liveCSGSystem = new LiveCSGSystem(this.renderer);

        this.gizmoSystem = new GizmoSystem(this.renderer);
        this.gizmoSystem.init();
    }

    get physicsSystems() {
        return {
            cloth: this.clothSystem,
            rigidBody: this.rigidBodySystem,
            metaball: this.metaballSystem,
            liveCSG: this.liveCSGSystem
        };
    }
}
