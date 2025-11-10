// B"H - TransformManager.js - Assuming basic structure
import * as THREE from 'three';
import { TransformControls } from 'three/addons/controls/TransformControls.js';

export class TransformManager {
    constructor(camera, domElement, scene, eventEmitter, historyManager, orbitControls) {
        this.camera = camera;
        this.domElement = domElement;
        this.scene = scene;
        this.eventEmitter = eventEmitter;
        
        this.transformStartState = null;
        
        this.historyManager = historyManager; // For transform commands
        this.orbitControls = orbitControls; // Store orbit controls

        this.transformControls = new TransformControls(camera, domElement);
        this.transformControls.enabled = false; // Enable only when object is selected
        this.transformControls.visible = false;
        this.scene.add(this.transformControls);

        this.selectedObjects = []; // Store actual selected objects
        this.activeObject = null; // Store the active object reference
        this.isDragging = false;

        this._setupEventListeners();
        console.log("B\"H - TransformManager Initialized");
    }

    _setupEventListeners() {
        // Listen for selection changes from ObjectManager
        // --- MODIFIED LISTENER ---
        this.eventEmitter.on('selectionChanged', (selectedIds, activeId) => {
            // Need object manager to get objects from IDs
            // This suggests TransformManager needs a reference to ObjectManager, or App needs to mediate
            // Option A: Pass ObjectManager in constructor
            // Option B: App listens and calls a method here `updateSelection(objects, activeObject)`
            // Let's assume Option A for now (add objectManager to constructor args)
            // if (!this.objectManager) { // Assuming objectManager is passed in constructor
            //     console.error("TransformManager needs ObjectManager reference!");
            //     return;
            // }
            // const objects = selectedIds.map(id => this.objectManager.getObjectByUUID(id)).filter(Boolean);
            // const activeObj = activeId ? this.objectManager.getObjectByUUID(activeId) : null;
            // this.updateSelection(objects, activeObj);

            // --- Option B: App mediates --- (App.js needs modification)
            // Assuming App listens to 'selectionChanged' and calls this method:
        });

        // In TransformManager.js -> _setupEventListeners()

this.transformControls.addEventListener('dragging-changed', (event) => {
    this.isDragging = event.value;
    if (this.orbitControls) {
        this.orbitControls.enabled = !this.isDragging;
    }
    this.eventEmitter.emit('transformDraggingChanged', this.isDragging);

    // --- START OF NEW CODE ---
    if (this.isDragging) {
        // DRAG STARTED: Capture the initial state of all selected objects
        this.transformStartState = this.selectedObjects.map(obj => ({
            uuid: obj.uuid,
            position: obj.position.clone(),
            quaternion: obj.quaternion.clone(),
            scale: obj.scale.clone()
        }));
    } else {
        // DRAG ENDED: If we have a start state, capture the end state and create a command
        if (this.transformStartState) {
            const endState = this.selectedObjects.map(obj => ({
                uuid: obj.uuid,
                position: obj.position.clone(),
                quaternion: obj.quaternion.clone(),
                scale: obj.scale.clone()
            }));

            // Create the command and add it to history
            const command = new MWA.Commands.TransformCommand(this.eventEmitter, this.transformStartState, endState);
            this.historyManager.add(command);

            // Clear the start state for the next operation
            this.transformStartState = null;
        }
    }
    // --- END OF NEW CODE ---
});

         this.transformControls.addEventListener('objectChange', () => {
             // Called frequently during drag
             this.eventEmitter.emit('objectTransformed', this.transformControls.object); // Inform properties panel etc.
         });

         // Listen for mode changes from Toolbar/Hotkeys
         this.eventEmitter.on('setTransformMode', (mode) => {
             this.setMode(mode);
         });
    }

     // --- NEW METHOD (Called by App or listener if using Option B) ---
     updateSelection(selectedObjects, activeObject) {
         this.selectedObjects = selectedObjects || [];
         this.activeObject = activeObject || null;

         if (this.selectedObjects.length === 0) {
             // No selection, detach and hide controls
             this.transformControls.detach();
             this.transformControls.enabled = false;
             this.transformControls.visible = false;
             console.log("B\"H TransformManager: Detached controls");
         } else if (this.selectedObjects.length === 1) {
             // Single selection, attach to it
             const target = this.selectedObjects[0];
              if (this.transformControls.object !== target) {
                 this.transformControls.attach(target);
              }
             this.transformControls.enabled = true;
             this.transformControls.visible = true;
             console.log(`B"H TransformManager: Attached to single object: ${target.name}`);
         } else {
             // Multiple selection, attach to the ACTIVE object
             if (this.activeObject && this.selectedObjects.includes(this.activeObject)) {
                 if (this.transformControls.object !== this.activeObject) {
                     this.transformControls.attach(this.activeObject);
                 }
                 this.transformControls.enabled = true;
                 this.transformControls.visible = true;
                  console.log(`B"H TransformManager: Attached to ACTIVE object: ${this.activeObject.name}`);
             } else {
                 // Multiple selected but no active one? Attach to first? Or detach? Detach for safety.
                 this.transformControls.detach();
                 this.transformControls.enabled = false;
                 this.transformControls.visible = false;
                 console.warn("B\"H TransformManager: Multiple selected, but no valid active object. Detaching controls.");
             }
         }
     }


    setMode(mode) {
        if (['translate', 'rotate', 'scale'].includes(mode)) {
             this.transformControls.setMode(mode);
             this.eventEmitter.emit('transformModeChanged', mode); // Notify UI
             console.log(`B"H TransformManager: Mode set to ${mode}`);
        }
    }

    update() {
        // Required if controls are updated manually, but usually handled internally
        // this.transformControls.update();
    }

    dispose() {
        this.transformControls.dispose();
        // Remove event listeners if added directly to window/document
    }
}