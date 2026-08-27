import * as THREE from 'three';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { TransformCommand } from '../History/Commands/TransformCommand.js'; 

export class TransformManager {
    constructor(camera, domElement, scene, eventEmitter, historyManager, orbitControls) {
        this.camera = camera;
        this.domElement = domElement;
        this.scene = scene;
        this.eventEmitter = eventEmitter;
        this.historyManager = historyManager;
        this.orbitControls = orbitControls;

        this.transformControls = new TransformControls(camera, domElement);
        this.scene.add(this.transformControls);
        
        // ** NEW: Internal state management **
        this.interactionMode = 'OBJECT'; // Can be 'OBJECT' or 'VERTEX'
        this.vertexChangeCallback = null; // Callback from EditModeManager

        this.selectedObjects = [];
        this.activeObject = null;
        this.isDragging = false;
        this.transformStartState = null;

        this._setupPermanentListeners();
        this.detach(); // Start in a clean, detached state
    }

    // ** CRITICAL: These listeners are set up ONCE and never removed. **
    _setupPermanentListeners() {
        this.transformControls.addEventListener('dragging-changed', (event) => {
            this.isDragging = event.value;
            this.orbitControls.enabled = !this.isDragging;
            // The logic to create Undo commands will be handled within the modes
        });

        // This listener now intelligently routes its behavior based on the mode
        this.transformControls.addEventListener('objectChange', () => {
            if (this.interactionMode === 'VERTEX' && this.vertexChangeCallback) {
                // In vertex mode, call the specific logic provided by EditModeManager
                this.vertexChangeCallback();
            }
            // Always emit the generic transform event for UI updates
            this.eventEmitter.emit('objectTransformed', this.transformControls.object);
        });
        
        this.eventEmitter.on('setTransformMode', (mode) => this.transformControls.setMode(mode));
    }

    // Called by EditModeManager to switch behavior
    setInteractionMode(mode, options = {}) {
        this.interactionMode = mode;
        this.vertexChangeCallback = options.onVertexChange || null;
    }

    // Called by App.js for OBJECT mode selection
    
	updateSelection(selectedObjects, activeObject) {
	    if (this.interactionMode !== 'OBJECT') return; // Safety check
	
	    this.selectedObjects = selectedObjects || [];
	    this.activeObject = activeObject || null;
	
	    let target = null;
	
	    // ** THIS IS THE NEW, ROBUST LOGIC **
	    // 1. Prioritize the official "active" object if it exists.
	    if (this.activeObject) {
	        target = this.activeObject;
	    } 
	    // 2. FALLBACK: If there is no active object BUT there is a selection,
	    //    use the last object in the selection list as the target.
	    else if (this.selectedObjects.length > 0) {
	        target = this.selectedObjects[this.selectedObjects.length - 1];
	    }
	
	    // Now, proceed with the determined target.
	    if (target) {
	        this.transformControls.ignoreTarget = false;
	        this.transformControls.showRotation = true;
	        this.transformControls.showScale = true;
	        this.transformControls.attach(target); // Attach to whatever target was found.
	        this.transformControls.enabled = true;
	        this.transformControls.visible = true;
	    } else {
	        // Only detach if there is absolutely no target.
	        this.detach();
	    }
	}

    // Called by EditModeManager for VERTEX mode
    attachToProxy(proxyObject) {
        if (this.interactionMode !== 'VERTEX') return; // Safety check

        if (proxyObject) {
            this.transformControls.ignoreTarget = true;
            this.transformControls.showRotation = false;
            this.transformControls.showScale = false;
            this.transformControls.setMode('translate');
            this.transformControls.attach(proxyObject);
            this.transformControls.enabled = true;
            this.transformControls.visible = true;
        } else {
            this.detach();
        }
    }

    // Universal detach function
    detach() {
        this.transformControls.detach();
        this.transformControls.enabled = false;
        this.transformControls.visible = false;
    }
}