
// B"H
/** 
 * @file webglRenderer.js 
 * @brief The Master Class of the Visual World.
 */
import { initWebGL } from './context.js';
import { manageScene } from './sceneManager.js';
import { animationLoop } from './animationLoop.js';
import { Camera } from '../camera/index.js';

import { initializeSystems } from './init/systemInit.js';
import { handleResize } from './lifecycle/resizeHandler.js';
import { setPlayMode } from './lifecycle/playModeHandler.js';
import { handleUpdate } from './lifecycle/updateHandler.js';
import { TransformController } from '../../input/transform/transformController.js'; // B"H - The New Hand of Providence

export class WebglRenderer {
    gl = null; canvas = null;
    camera = null;
    
    // Systems
    programManager = null;
    systemManager = null;
    drawingManager = null;
    animationManager = null;
    inputManager = null;
    playerController = null;
    transformController = null; // B"H - Controls selections and gizmos
    
    // State
    isPlaying = false;
    sceneParser = null; 
    orbitControls = null;
    rootAnimatedObjects = []; 
    objectMap = new Map();
    cameraAnimation = []; 
    isCameraAnimationEnabled = true;
    
    // View Config
    shadowsEnabled = true; 
    wireframesEnabled = false; 
    showSkeleton = false; 
    
    // Temporal
    startTime = 0; 
    lastFrameTime = 0; 
    sceneData = null; 
    frameCount = 0;

    init(containerId) {
        const context = initWebGL(containerId);
        if (!context) return;
        this.gl = context.gl; 
        this.canvas = context.canvas;
        
        console.log(`B"H - WebglRenderer: Orchestrator Initializing...`);

        this.camera = new Camera();
        
        initializeSystems(this);

        // B"H - Awaken the Transform Controller
        this.transformController = new TransformController(this);
        this.transformController.enable();

        this.startTime = performance.now(); 
        this.lastFrameTime = this.startTime;

        window.addEventListener('resize', () => this.resize(), false);
        this.resize();
    }

    setPlayMode(enabled) { setPlayMode(this, enabled); }
    resize() { handleResize(this); }
    update(dt) { handleUpdate(this, dt); }
    
    loadScene(sceneData, orbitControls) { 
        window.__SELECTED_OBJECT__ = null; // Clear selection on scene change
        manageScene.loadScene(this, sceneData, orbitControls); 
        this.resize(); 
    }
    
    setCameraAnimationEnabled(enabled) { this.isCameraAnimationEnabled = enabled; }
    setShadowsEnabled(enabled) { manageScene.setShadowsEnabled(this, enabled); }
    setWireframesEnabled(enabled) { manageScene.setWireframesEnabled(this, enabled); }
    setSkeletonEnabled(enabled) { manageScene.setSkeletonEnabled(this, enabled); } 
    
    animate() { animationLoop.animate(this); }
}
