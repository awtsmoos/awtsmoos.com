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
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { EditModeManager } from './Interaction/EditModeManager.js'; 
import { AnimationClip } from 'three';
import { VectorKeyframeTrack, QuaternionKeyframeTrack, NumberKeyframeTrack } from 'three';

const OUTLINE_COLOR_SELECTED = 0xffff00; // Yellow
const OUTLINE_COLOR_ACTIVE = 0xffa500; // Orange
const OUTLINE_SCALE = 1.03; 

class App {
    constructor() {
        console.log('B\"H\n - Mitzvah World Animator Initializing...');
        this.eventEmitter = new EventEmitter();
        this.setupDOM();

        this.historyManager = new HistoryManager(this.eventEmitter);
        this.sceneManager = new SceneManager(HTML.id('canvas'), this.eventEmitter);
        this.objectManager = new ObjectManager(this.sceneManager.scene, this.eventEmitter, this.historyManager);
        this.timelineManager = new TimelineManager(this.eventEmitter, this.objectManager, this.historyManager);
        
        this.transformManager = new TransformManager(this.sceneManager.camera, this.sceneManager.renderer.domElement, this.sceneManager.scene, this.eventEmitter, this.historyManager, this.sceneManager.controls);
        this.inputManager = new InputManager(this.sceneManager.renderer.domElement, this.eventEmitter, this.objectManager, this.transformManager, this.sceneManager.camera);
        this.editModeManager = new EditModeManager(this.sceneManager.scene, this.eventEmitter, this.historyManager, this.objectManager, this.transformManager);
        
        this.uiManager = new UIManager(HTML.id('ui-container'), this.eventEmitter, this.objectManager, this.timelineManager, this.transformManager, this.historyManager);

        this.appMode = 'OBJECT';
        this.outlineMeshes = new Map();
        
        this.setupOrbitGizmo();
        this.connectEventListeners();
        
        this.animate = this.animate.bind(this);
        requestAnimationFrame(this.animate);
        console.log('B\"H\n - Application Initialized');
    }
    
     connectEventListeners() {
        this.eventEmitter.on('selectionChanged', (selectedIds, activeId) => {
            if (this.appMode === 'OBJECT') {
                const objects = this.objectManager.getObjectsByIds(selectedIds);
                const activeObj = activeId ? this.objectManager.getObjectByUUID(activeId) : null;
                this.transformManager.updateSelection(objects, activeObj);
                this.updateSimpleOutlines(selectedIds, activeId);
            }
        });

	    this.sceneManager.renderer.domElement.addEventListener('pointerdown', this.onPointerDown.bind(this));

        this.eventEmitter.on('exportGLBRequest', this.exportSelectedGLB.bind(this));
        this.eventEmitter.on('toggleEditModeRequest', this.toggleEditMode.bind(this));
        
        // B"H: Connect the 'A' key press to the handler
        this.eventEmitter.on('editModeSelectAllRequest', () => this.editModeManager.toggleSelectAll());
        
        this.eventEmitter.on('geometryChanged', ({ uuid }) => {
            if (this.appMode === 'EDIT' && this.editModeManager.targetObject?.uuid === uuid) {
                this.editModeManager.updateGizmoPosition();
            }
        });
    }

    onPointerDown(event) {
        if (this.transformManager.transformControls.axis) {
            return;
        }

        if (this.appMode === 'EDIT') {
            this.editModeManager.handlePointerDown(event);
        } else {
	        if (event.button !== 0) return;
            this.inputManager.handlePointerDown(event);
        }
    }

    toggleEditMode() {
        if (this.appMode === 'OBJECT') {
            const selected = this.objectManager.getSelectedObjects();
            if (selected.length === 1 && selected[0].isMesh) {
                this.appMode = 'EDIT';
                this.updateSimpleOutlines([], null); 
                this.editModeManager.enter(selected[0]);
            }
        } else {
            this.appMode = 'OBJECT';
            const editedObject = this.editModeManager.targetObject;
            
            this.editModeManager.exit(); 
            
            if (editedObject) {
                this.objectManager.selectObject(editedObject.uuid, true);
            }
        }
    }

    updateSimpleOutlines(selectedIds, activeId) {
        const currentSelection = new Set(selectedIds);
        const previousOutlineUUIDs = new Set(this.outlineMeshes.keys());

        previousOutlineUUIDs.forEach(uuid => {
            if (!currentSelection.has(uuid)) {
                const outlineMesh = this.outlineMeshes.get(uuid);
                if (outlineMesh) {
                    outlineMesh.removeFromParent();
                    outlineMesh.material.dispose();
                    this.outlineMeshes.delete(uuid);
                }
            }
        });

        currentSelection.forEach(uuid => {
            const object = this.objectManager.getObjectByUUID(uuid);
            if (!object || !object.isMesh) return;

            const isActive = uuid === activeId;
            const targetColor = isActive ? OUTLINE_COLOR_ACTIVE : OUTLINE_COLOR_SELECTED;

            let outlineMesh = this.outlineMeshes.get(uuid);

            if (!outlineMesh) {
                const outlineMaterial = new THREE.MeshBasicMaterial({
                    color: targetColor,
                    side: THREE.BackSide,
                    depthWrite: false,
                    transparent: true,
                    opacity: 0.8
                });

                outlineMesh = new THREE.Mesh(object.geometry, outlineMaterial);
                outlineMesh.scale.copy(object.scale).multiplyScalar(OUTLINE_SCALE);
                outlineMesh.userData.isOutline = true;
                outlineMesh.userData.isSelectable = false;

                object.add(outlineMesh);
                this.outlineMeshes.set(uuid, outlineMesh);

            } else {
                if (outlineMesh.material.color.getHex() !== targetColor) {
                    outlineMesh.material.color.setHex(targetColor);
                }
                 outlineMesh.scale.copy(object.scale).multiplyScalar(OUTLINE_SCALE);
            }
        });
    }

    cleanupOutlines() {
        this.outlineMeshes.forEach(outlineMesh => {
            outlineMesh.removeFromParent();
            outlineMesh.material.dispose();
        });
        this.outlineMeshes.clear();
    }

    setupDOM() {
        const uiContainer = HTML.id('ui-container');
        if (!uiContainer) {
            console.error("UI Container not found!");
            return;
        }
    }
    
     exportSelectedGLB() {
        const selectedObjects = this.objectManager.getSelectedObjects();
        if (selectedObjects.length !== 1) { return; }
        const objectToExport = selectedObjects[0];

        const clone = objectToExport.clone();

        for (let i = clone.children.length - 1; i >= 0; i--) {
            if (clone.children[i].userData.isOutline) {
                clone.remove(clone.children[i]);
            }
        }

        clone.traverse((node) => {
            if (node.isMesh && node.material) {
                const originalMaterial = node.material;
                const lambertMaterial = new THREE.MeshLambertMaterial();
                lambertMaterial.color.copy(originalMaterial.color);
                lambertMaterial.map = originalMaterial.map;
                node.material = lambertMaterial;
            }
        });

        const tempScene = new THREE.Scene();
        tempScene.add(clone);

        const animationClip = this.generateAnimationClipForObject(objectToExport, clone);
        if (animationClip) {
            animationClip.userData = {};
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
                }
            },
            (error) => {
                console.error('An error happened during GLB export:', error);
            },
            options
        );
    }

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
        const currentTime = this.timelineManager.currentTime;
        this.timelineManager.update(currentTime, delta);
        this.sceneManager.render();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.MWA = new App();
});