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
// --- 1. IMPORT THE EXPORTER ---
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';

import { EditModeManager } from './Interaction/EditModeManager.js'; 
import { AnimationClip } from 'three';
import { VectorKeyframeTrack, QuaternionKeyframeTrack, NumberKeyframeTrack } from 'three';

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
        console.log('B\"H\n - Mitzvah World Animator Initializing...');
        this.eventEmitter = new EventEmitter();
        this.setupDOM();

        // Core Managers
        this.historyManager = new HistoryManager(this.eventEmitter);
        this.sceneManager = new SceneManager(HTML.id('canvas'), this.eventEmitter);
        this.objectManager = new ObjectManager(this.sceneManager.scene, this.eventEmitter, this.historyManager);
        this.timelineManager = new TimelineManager(this.eventEmitter, this.objectManager, this.historyManager);
        
        // Interaction Managers
        this.transformManager = new TransformManager(this.sceneManager.camera, this.sceneManager.renderer.domElement, this.sceneManager.scene, this.eventEmitter, this.historyManager, this.sceneManager.controls);
        this.inputManager = new InputManager(this.sceneManager.renderer.domElement, this.eventEmitter, this.objectManager, this.transformManager, this.sceneManager.camera);
        this.editModeManager = new EditModeManager(this.sceneManager.scene, this.eventEmitter, this.historyManager, this.objectManager, this.transformManager.transformControls, this.sceneManager.controls);

        // UI Manager (must be after others)
        this.uiManager = new UIManager(HTML.id('ui-container'), this.eventEmitter, this.objectManager, this.timelineManager, this.transformManager, this.historyManager);

        // App State
        this.appMode = 'OBJECT'; // 'OBJECT' or 'EDIT'
        this.outlineMeshes = new Map();
        
        this.setupOrbitGizmo();
        this.connectEventListeners();
        
        this.animate = this.animate.bind(this);
        requestAnimationFrame(this.animate);
        console.log('B\"H\n - Application Initialized');
    }
    
    connectEventListeners() {
        this.eventEmitter.on('selectionChanged', (selectedIds, activeId) => {
            // ** FIX: Only update object-level gizmo and outlines if NOT in edit mode **
            if (this.appMode === 'OBJECT') {
                const objects = this.objectManager.getObjectsByIds(selectedIds);
                const activeObj = activeId ? this.objectManager.getObjectByUUID(activeId) : null;
                this.transformManager.updateSelection(objects, activeObj);
                this.updateSimpleOutlines(selectedIds, activeId);
            }
        });

        this.eventEmitter.on('exportGLBRequest', this.exportSelectedGLB.bind(this));
        this.eventEmitter.on('toggleEditModeRequest', this.toggleEditMode.bind(this));
        
        this.sceneManager.renderer.domElement.addEventListener('pointerdown', (event) => {
            if (this.appMode === 'EDIT' && event.target === this.sceneManager.renderer.domElement && !this.transformManager.isDragging) {
                const mouse = new THREE.Vector2();
                const rect = this.sceneManager.renderer.domElement.getBoundingClientRect();
                mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
                mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
                this.editModeManager.handlePointerDown(mouse, this.sceneManager.camera);
            }
        });
        
        this.eventEmitter.on('geometryChanged', ({ uuid }) => {
            if (this.appMode === 'EDIT' && this.editModeManager.targetObject?.uuid === uuid) {
                this.editModeManager._attachTransformToSelection();
            }
        });
    }

    toggleEditMode() {
        if (this.appMode === 'OBJECT') {
            const selected = this.objectManager.getSelectedObjects();
            if (selected.length === 1 && selected[0].isMesh) {
                this.appMode = 'EDIT';
                
                // Clear object-level visuals BEFORE entering edit mode
                this.updateSimpleOutlines([], null); 
                this.transformManager.updateSelection([], null);
                this.objectManager.clearSelection(false); // Clear selection state without firing another event
                
                this.editModeManager.enter(selected[0]);
             //   this.sceneManager.controls.enabled = false;
            }
        } else {
            this.appMode = 'OBJECT';
            const editedObject = this.editModeManager.targetObject;
            this.editModeManager.exit();
            
            this.sceneManager.controls.enabled = true;
            
            // After exiting, re-select the object to restore its outline and transform gizmo
            if (editedObject) {
                this.objectManager.selectObject(editedObject.uuid, true);
            }
        }
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
    
     exportSelectedGLB() {
        const selectedObjects = this.objectManager.getSelectedObjects();
        if (selectedObjects.length !== 1) { return; }
        const objectToExport = selectedObjects[0];

        // 1. Create a clone.
        const clone = objectToExport.clone();

        // 2. Clean the clone by removing the editor-only outline mesh.
        for (let i = clone.children.length - 1; i >= 0; i--) {
            if (clone.children[i].userData.isOutline) {
                clone.remove(clone.children[i]);
            }
        }

        // 3. *** NEW STEP: Convert materials to MeshLambertMaterial for export ***
        // We traverse the cleaned clone to find every mesh within it.
        clone.traverse((node) => {
            if (node.isMesh && node.material) {
                // Get the original material from the node
                const originalMaterial = node.material;

                // Create a new Lambert material
                const lambertMaterial = new THREE.MeshLambertMaterial();

                // Copy the essential properties you want to preserve
                lambertMaterial.color.copy(originalMaterial.color);
                lambertMaterial.map = originalMaterial.map; // Preserves the main texture
                
                // You can copy other properties as needed, for example:
                // lambertMaterial.opacity = originalMaterial.opacity;
                // lambertMaterial.transparent = originalMaterial.transparent;

                // Replace the material on this specific mesh within the clone
                node.material = lambertMaterial;
            }
        });

        // 4. Add the clean clone (now with Lambert materials) to a temporary scene.
        const tempScene = new THREE.Scene();
        tempScene.add(clone);

        // 5. Generate and sanitize the animation clip. This part is now correct.
        const animationClip = this.generateAnimationClipForObject(objectToExport, clone);
        if (animationClip) {
            animationClip.userData = {}; // Ensure userData exists on the clip
            tempScene.animations = [animationClip];
        }

        const exporter = new GLTFExporter();
        const options = {
            binary: true,
            animations: tempScene.animations
        };

        exporter.parse(
            tempScene,
            (result) => {
                if (result instanceof ArrayBuffer) {
                    const blob = new Blob([result], { type: 'application/octet-stream' });
                    const filename = `${objectToExport.name || 'export'}.glb`;
                    this.saveBlob(blob, filename);
                    console.log('B\"H \n--- EXPORT SUCCEEDED with Lambert-style materials! ---');
                }
            },
            (error) => {
                console.error('An error happened during GLB export:', error);
            },
            options
        );
    }


    // This function is now correct because it uses the clone's name for the tracks.
    // The sanitization step in the main function will handle any remaining issues.
    generateAnimationClipForObject(originalObject, objectForNaming) {
        const layer = this.timelineManager.getLayer(originalObject.uuid);
        if (!layer || layer.tracks.size === 0) {
            return null;
        }

        const objectName = objectForNaming.name;
        const finalTracks = [];
        const trackGroups = {};

        layer.tracks.forEach((track, propertyPath) => {
            if (track.keyframes.length === 0) return;
            const pathParts = propertyPath.split('.');
            const baseName = pathParts[0];
            const component = pathParts.length > 1 ? pathParts[1] : null;
            if (!trackGroups[baseName]) { trackGroups[baseName] = {}; }
            if (component) { trackGroups[baseName][component] = track; }
            else { trackGroups[baseName].single = track; }
        });

        for (const baseName in trackGroups) {
            const group = trackGroups[baseName];
            if (baseName === 'material') { continue; }

            if (baseName === 'position' || baseName === 'scale') {
                const componentTracks = ['x', 'y', 'z'].map(axis => group[axis]);
                if (componentTracks.some(t => t)) {
                    const timesSet = new Set();
                    componentTracks.forEach(track => { if (track) track.keyframes.forEach(kf => timesSet.add(kf.time)); });
                    const sortedTimes = Array.from(timesSet).sort((a, b) => a - b);
                    const values = [];
                    const defaultValue = baseName === 'scale' ? 1 : 0;
                    sortedTimes.forEach(time => {
                        values.push(group.x?.getValue(time) ?? defaultValue);
                        values.push(group.y?.getValue(time) ?? defaultValue);
                        values.push(group.z?.getValue(time) ?? defaultValue);
                    });
                    const track = new VectorKeyframeTrack(`${objectName}.${baseName}`, sortedTimes, values);
                    track.userData = {};
                    finalTracks.push(track);
                    finalTracks.userData = {};
                }
            } else if (baseName === 'rotation') {
                const componentTracks = ['x', 'y', 'z'].map(axis => group[axis]);
                if (componentTracks.some(t => t)) {
                    const timesSet = new Set();
                    componentTracks.forEach(track => { if (track) track.keyframes.forEach(kf => timesSet.add(kf.time)); });
                    const sortedTimes = Array.from(timesSet).sort((a, b) => a - b);
                    const values = [];
                    const tempEuler = new THREE.Euler();
                    const tempQuat = new THREE.Quaternion();
                    sortedTimes.forEach(time => {
                        tempEuler.set(group.x?.getValue(time) ?? 0, group.y?.getValue(time) ?? 0, group.z?.getValue(time) ?? 0, 'XYZ');
                        tempQuat.setFromEuler(tempEuler);
                        values.push(tempQuat.x, tempQuat.y, tempQuat.z, tempQuat.w);
                    });
                    const track = new QuaternionKeyframeTrack(`${objectName}.quaternion`, sortedTimes, values);
                    finalTracks.push(track);
                }
            }
        }

        if (finalTracks.length > 0) {
            const duration = this.timelineManager.endTime;
            const clip = new AnimationClip('Action', duration, finalTracks);

            // *** THIS IS THE SOLUTION ***
            // The GLTFExporter requires the AnimationClip itself to have a userData object.
            clip.userData = {};

            return clip;
        }

        return null;
    }
    
    
    saveBlob(blob, filename) {
        const link = document.createElement('a');
        link.style.display = 'none';
        document.body.appendChild(link);

        const url = URL.createObjectURL(blob);
        link.href = url;
        link.download = filename;
        link.click();

        URL.revokeObjectURL(url);
        document.body.removeChild(link);
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
        const currentTime = this.timelineManager.currentTime; // Get time from timeline

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