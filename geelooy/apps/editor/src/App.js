// B"H
import * as THREE from 'three';
import { SceneManager } from './Scene/SceneManager.js';
import { UIManager } from './UI/UIManager.js';
import { ObjectManager } from './Objects/ObjectManager.js';
import { TimelineManager } from './Timeline/TimelineManager.js';
import { TransformManager } from './Interaction/TransformManager.js';
import { HistoryManager } from './History/HistoryManager.js';
import { InputManager } from './Interaction/InputManager.js';
import { HTML } from './Core/HTML.js';
import { EventEmitter } from './Core/EventEmitter.js';
import { OrbitControlsGizmo } from 'three/addons/controls/OrbitControlsGizmo.js'; // Keep for now

// --- Add constants for outline colors ---
const OUTLINE_COLOR_SELECTED = 0xffff00; // Yellow
const OUTLINE_COLOR_ACTIVE = 0xffa500; // Orange
const OUTLINE_SCALE = 1.03; // Adjust as needed (e.g., 1.01 to 1.05)

/**
 * Main Application Class
 * Orchestrates all the different modules.
 */
class App {
    constructor() {
        console.log("B\"H - Mitzvah World Animator Initializing...");
        this.eventEmitter = new EventEmitter();
        this.setupDOM();

        this.historyManager = new HistoryManager(this.eventEmitter);
        this.sceneManager = new SceneManager(HTML.id('canvas'), this.eventEmitter);
        this.objectManager = new ObjectManager(this.sceneManager.scene, this.eventEmitter, this.historyManager);
        // *** PASS ORBIT CONTROLS TO TRANSFORM MANAGER ***
        this.transformManager = new TransformManager(
            this.sceneManager.camera,
            this.sceneManager.renderer.domElement,
            this.sceneManager.scene,
            this.eventEmitter,
            this.historyManager,
            this.sceneManager.controls // <-- Add this argument
        );
        
        this.timelineManager = new TimelineManager(this.eventEmitter, this.objectManager);
        this.uiManager = new UIManager(HTML.id('ui-container'), this.eventEmitter, this.objectManager, this.timelineManager, this.transformManager, this.historyManager); // Pass necessary modules
        this.inputManager = new InputManager(this.sceneManager.renderer.domElement, this.eventEmitter, this.objectManager, this.transformManager, this.sceneManager.camera); // Handles inputs

        this.setupOrbitGizmo(); // Optional Gizmo
        this.outlineMeshes = new Map();


        this.eventEmitter.on('selectionChanged', (selectedIds, activeId) => {
            const objects = this.objectManager.getObjectsByIds(selectedIds);
            const activeObj = activeId ? this.objectManager.getObjectByUUID(activeId) : null;

            // Update TransformManager (keep this)
            this.transformManager.updateSelection(objects, activeObj);

            // --- NEW: Update Simple Outlines ---
            this.updateSimpleOutlines(selectedIds, activeId);

            // ... other updates ...
        });

        // ... rest of constructor ...
    
        // Link modules that need references to each other (minimize direct dependencies)
        // Example: Timeline needs to know when selection changes to potentially show relevant tracks
         // --- MODIFIED SELECTION LISTENER (Option B - Mediation) ---
         // --- NEW: Method to manage simple outlines ---
    
        // --- END MODIFIED LISTENER -

        this.eventEmitter.on('objectAdded', (object) => {
             this.timelineManager.createLayerForObject(object);
        });

        this.eventEmitter.on('objectRemoved', (object) => {
             this.timelineManager.removeLayerForObject(object);
        });

        // More event connections as needed...

        this.eventEmitter.on('orbitControlsEnable', (enabled) => {
            if (this.sceneManager && this.sceneManager.controls) {
                 // Directly enable or disable the OrbitControls instance
                 this.sceneManager.controls.enabled = enabled;
                 // Optional logging for debugging:
                 // console.log(`OrbitControls set to: ${enabled}`);
            } else {
                 console.warn("SceneManager or OrbitControls not available to toggle state.");
            }
        });
        // ***** END OF ADDED LISTENER *****
    
        // Start the animation loop
        this.animate = this.animate.bind(this); // Bind context
        requestAnimationFrame(this.animate);

        console.log("B\"H - Application Initialized");
        // Add initial object for testing
        // this.objectManager.createPrimitive('Box'); // Example
    }



updateSimpleOutlines(selectedIds, activeId) {
    const currentSelection = new Set(selectedIds);
    const previousOutlineUUIDs = new Set(this.outlineMeshes.keys());

    // Remove outlines from objects no longer selected
    previousOutlineUUIDs.forEach(uuid => {
        if (!currentSelection.has(uuid)) {
            const outlineMesh = this.outlineMeshes.get(uuid);
            if (outlineMesh) {
                outlineMesh.removeFromParent();
                outlineMesh.material.dispose();
                // Geometry is shared, DO NOT dispose geometry here
                this.outlineMeshes.delete(uuid);
                console.log(`B"H Removed outline for ${uuid}`);
            }
        }
    });

    // Add or update outlines for currently selected objects
    currentSelection.forEach(uuid => {
        const object = this.objectManager.getObjectByUUID(uuid);
        if (!object || !object.isMesh) return; // Only outline meshes for simplicity

        const isActive = uuid === activeId;
        const targetColor = isActive ? OUTLINE_COLOR_ACTIVE : OUTLINE_COLOR_SELECTED;

        let outlineMesh = this.outlineMeshes.get(uuid);

        if (!outlineMesh) {
            // Create outline mesh if it doesn't exist
            const outlineMaterial = new THREE.MeshBasicMaterial({
                color: targetColor,
                side: THREE.BackSide,
                depthWrite: false, // Try disabling depth write to render on top
                // depthTest: false, // More aggressive, might draw through objects
                transparent: true, // Optional: allows for opacity later
                opacity: 0.8      // Optional: make slightly transparent
            });

            // IMPORTANT: Create a NEW MESH but use SHARED GEOMETRY
            outlineMesh = new THREE.Mesh(object.geometry, outlineMaterial);
            outlineMesh.scale.copy(object.scale).multiplyScalar(OUTLINE_SCALE); // Scale relative to object's scale
            outlineMesh.userData.isOutline = true; // Mark it so raycasting can ignore it
            outlineMesh.userData.isSelectable = false; // Not selectable

            object.add(outlineMesh); // Add as child of the original object
            this.outlineMeshes.set(uuid, outlineMesh);
            console.log(`B"H Added ${isActive ? 'active' : 'selected'} outline for ${object.name}`);

        } else {
            // Outline exists, just update color if needed
            if (outlineMesh.material.color.getHex() !== targetColor) {
                outlineMesh.material.color.setHex(targetColor);
                console.log(`B"H Updated outline color for ${object.name} to ${isActive ? 'active' : 'selected'}`);
            }
             // Ensure scale is correct if parent scale changed (might need more robust update)
             outlineMesh.scale.copy(object.scale).multiplyScalar(OUTLINE_SCALE);
        }
    });

}
    // --- Clean up outlines on exit/clear ---
cleanupOutlines() {
    this.outlineMeshes.forEach(outlineMesh => {
         outlineMesh.removeFromParent();
         outlineMesh.material.dispose();
    });
    this.outlineMeshes.clear();
}

    setupDOM() {
        // Basic structure is in HTML, UIManager will populate panels
        const uiContainer = HTML.id('ui-container');
        if (!uiContainer) {
            console.error("UI Container not found!");
            return;
        }
        // UIManager will create and append panels here
    }

    setupOrbitGizmo() {
        const gizmoContainer = HTML.id('orbit-gizmo-container');
        if (gizmoContainer && this.sceneManager.controls) {
            const controlsGizmo = new OrbitControlsGizmo(this.sceneManager.controls, { size: 80, padding: 8 });
            gizmoContainer.appendChild(controlsGizmo.domElement);
        } else {
            console.warn("OrbitControls or Gizmo container not available.");
        }
    }

    animate(time) {
        requestAnimationFrame(this.animate);

        const delta = this.sceneManager.clock.getDelta();
        const currentTime = this.timelineManager.getCurrentTime(); // Get time from timeline

        // Update components that need animation frame updates
        this.transformManager.update(); // Handles TransformControls updates
        this.timelineManager.update(currentTime, delta); // Updates animator which applies keyframes

        // Render the scene
        this.sceneManager.render();
    }
}

// Initialize the application when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.MWA = new App(); // Assign to window for debugging (optional)
});