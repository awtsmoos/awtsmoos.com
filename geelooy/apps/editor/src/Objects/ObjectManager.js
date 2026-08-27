// B"H
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Utils } from '../Core/Utils.js'; // Assuming Utils.js exists and has generateUniqueName
import { CreateObjectCommand } from '../History/Commands/CreateObjectCommand.js';
import { RemoveObjectCommand } from '../History/Commands/RemoveObjectCommand.js';
import { GroupCommand } from '../History/Commands/GroupCommand.js';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';

/**
 * Manages scene objects: creation, deletion, selection, grouping.
 * Interacts with HistoryManager using Command pattern.
 */
export class ObjectManager {
    constructor(scene, eventEmitter, historyManager) {
        this.scene = scene;
        this.eventEmitter = eventEmitter;
        this.historyManager = historyManager;
        this.objects = new Map(); // Store objects by UUID { uuid: object }
        this.selectedObjectUUIDs = new Set();
        this.activeObjectUUID = null; // Track the active object (last clicked/made active)
        this.gltfLoader = new GLTFLoader();
        this.multipleSelectionEnabled = false; // For "sticky" multi-select mode

        // --- Register Event Listeners ---
        this.eventEmitter.on('createPrimitiveRequest', this.createPrimitive.bind(this));
        this.eventEmitter.on('loadGLBRequest', this.loadGLB.bind(this));
        this.eventEmitter.on('deleteSelectedRequest', this.deleteSelectedObjects.bind(this));
        this.eventEmitter.on('groupSelectedRequest', this.groupSelectedObjectsAsParentChild.bind(this));
        this.eventEmitter.on('ungroupSelectedRequest', this.ungroupSelectedObjectFromParent.bind(this));
        this.eventEmitter.on('toggleMultipleSelection', this.handleToggleMultipleSelection.bind(this));
        this.eventEmitter.on('objectClicked', this.handleObjectClicked.bind(this));
        this.eventEmitter.on('canvasClicked', this.handleCanvasClicked.bind(this));
        this.eventEmitter.on('focusSelectedRequest', this.focusSelected.bind(this));

        console.log("B\"H - ObjectManager Initialized");
    }

    _addObjectInternal(object, parent = this.scene, selectable = true, emitEvents = true) {
        if (!object || !object.uuid) {
            console.error("B\"H ObjectManager: _addObjectInternal - Invalid object.", object);
            return null;
        }
        if (this.objects.has(object.uuid)) {
             if (object.parent !== parent) { parent.add(object); }
             object.userData.isSelectable = selectable;
             return object;
        }

        if (!object.name) {
            let baseName = object.userData?.type || object.type || 'Object';
            if (object.isGroup) baseName = 'Group';
            object.name = Utils.generateUniqueName(baseName, (name) => this.getObjectByName(name));
        }
        object.userData = object.userData || {};
        object.userData.isSelectable = selectable;

        this.objects.set(object.uuid, object);
        parent.add(object);

        object.traverse((child) => {
            if (child !== object && (child.isMesh || child.isLight || child.isCamera || child.isGroup )) {
                if (!this.objects.has(child.uuid)) {
                     this.objects.set(child.uuid, child);
                     child.userData = child.userData || {};
                     child.userData.isSelectable = true;
                     if (!child.name) {
                        let childBase = child.type || 'Child';
                        child.name = Utils.generateUniqueName(childBase, (name) => this.getObjectByName(name));
                     }
                }
            }
        });

        if (emitEvents) {
             this.eventEmitter.emit('objectAdded', object);
             this.eventEmitter.emit('sceneGraphChanged');
        }

        return object;
    }

    _removeObjectInternal(objectUUID) {
        const object = this.objects.get(objectUUID);
        if (!object) return null;

        const wasActive = this.activeObjectUUID === objectUUID;

        const childrenToRemoveUUIDs = [];
        object.traverse((child) => {
             if (child !== object && this.objects.has(child.uuid)) {
                 childrenToRemoveUUIDs.push(child.uuid);
             }
        });
        childrenToRemoveUUIDs.forEach(childUUID => {
            this.objects.delete(childUUID);
            this.selectedObjectUUIDs.delete(childUUID);
        });

        object.removeFromParent();
        this.objects.delete(objectUUID);
        this.selectedObjectUUIDs.delete(objectUUID);

        if (wasActive) { this.activeObjectUUID = null; }
        
        return object;
    }

    _reparentObjectsInternal(parentUUID, childUUIDs) {
        const parentObject = this.objects.get(parentUUID);
        if (!parentObject) return { success: false, originalParents: {} };
        const childrenToReparent = childUUIDs.map(uuid => this.objects.get(uuid)).filter(Boolean);
        if (childrenToReparent.length === 0 || childUUIDs.includes(parentUUID)) {
            return { success: false, originalParents: {} };
        }

        const originalParents = {};
        let success = true;

        childrenToReparent.forEach(child => {
            if (child.parent) {
                 originalParents[child.uuid] = child.parent.uuid;
                 try { parentObject.attach(child); } catch(e) { success = false; }
            } else { success = false; }
        });
        return { success, originalParents };
    }

    _unparentObjectsInternal(childUUIDs) {
        const childrenToUnparent = childUUIDs.map(uuid => this.objects.get(uuid)).filter(Boolean);
        if (childrenToUnparent.length === 0) return { success: false, originalParents: {} };

        const originalParents = {};
        let success = true;

        childrenToUnparent.forEach(child => {
            const currentParent = child.parent;
            if (!currentParent) {
                 originalParents[child.uuid] = this.scene.uuid;
                 return;
            }
            originalParents[child.uuid] = currentParent.uuid;
            if (currentParent === this.scene) return;

            const grandParent = currentParent.parent || this.scene;
            try { grandParent.attach(child); } catch(e) { success = false; }
        });
         return { success, originalParents };
    }

    createPrimitive(type = 'Box', position = new THREE.Vector3(0, 0.5, 0)) {
        let geometry;
        const size = 1;
        switch (type.toLowerCase()) {
            case 'sphere': geometry = new THREE.SphereGeometry(size / 2, 32, 16); break;
            case 'plane': geometry = new THREE.PlaneGeometry(size, size); position.y = 0; break;
            case 'cylinder': geometry = new THREE.CylinderGeometry(size / 2, size / 2, size, 32); position.y = size / 2; break;
            case 'cone': geometry = new THREE.ConeGeometry(size / 2, size, 32); position.y = size / 2; break;
            case 'torus': geometry = new THREE.TorusGeometry(size / 2, size / 4, 16, 100); position.y = size / 2; break;
            case 'box': default: geometry = new THREE.BoxGeometry(size, size, size); position.y = size / 2; type = 'Box'; break;
        }

        // --- B"H THIS IS THE CORRECTED FIX ---
        // 1. Temporarily remove the attributes that prevent merging.
        geometry.deleteAttribute('normal');
        geometry.deleteAttribute('uv');
        
        // 2. Merge vertices based on position only.
        geometry = BufferGeometryUtils.mergeVertices(geometry);
        
        // 3. Now that vertices are shared, recalculate normals for correct lighting.
        geometry.computeVertexNormals();
        // --- END OF FIX ---

        const material = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7, metalness: 0.1, side: THREE.DoubleSide });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(position);
        mesh.userData.type = type;

        const command = new CreateObjectCommand(this, mesh, this.scene.uuid);
        this.historyManager.add(command);
        return mesh;
    }

    async loadGLB(url, position = new THREE.Vector3(0, 0, 0)) {
        try {
            const gltf = await this.gltfLoader.loadAsync(url);
            const object = gltf.scene;
            object.position.copy(position);
            object.userData.type = 'GLB';

            object.traverse((child) => {
                 if (child.isMesh || child.isLight || child.isCamera || child.isGroup) {
                     child.userData = child.userData || {};
                     child.userData.isSelectable = true;
                     if (!child.name) child.name = Utils.generateUniqueName(child.type || 'Child', (name) => this.getObjectByName(name));
                 }
            });
            object.userData.isSelectable = true;
            if (!object.name) object.name = Utils.generateUniqueName('GLB_Model', (name) => this.getObjectByName(name));

            const command = new CreateObjectCommand(this, object, this.scene.uuid);
            this.historyManager.add(command);
            return object;
        } catch (error) {
            console.error('B"H - Error loading GLB:', error);
            this.eventEmitter.emit('error', `Failed to load GLB: ${error.message || error}`);
            return null;
        } finally {
             if (url.startsWith('blob:')) URL.revokeObjectURL(url);
        }
    }

    deleteSelectedObjects() {
        const uuidsToRemove = Array.from(this.selectedObjectUUIDs);
        if (uuidsToRemove.length === 0) return;

        const objectsToRemove = uuidsToRemove.map(uuid => this.objects.get(uuid)).filter(Boolean);
        objectsToRemove.forEach(obj => {
            const command = new RemoveObjectCommand(this, obj, obj.parent?.uuid);
            this.historyManager.add(command);
        });
    }

    groupSelectedObjectsAsParentChild() {
        const selectedUUIDs = this.getSelectedObjectUUIDs();
        const activeUUID = this.activeObjectUUID;

        if (selectedUUIDs.length < 2 || !activeUUID || !this.selectedObjectUUIDs.has(activeUUID)) return;
        
        const command = new GroupCommand(this, selectedUUIDs, 'parent', activeUUID);
        this.historyManager.add(command);
    }

    ungroupSelectedObjectFromParent() {
        const selectedUUIDs = this.getSelectedObjectUUIDs();
        if (selectedUUIDs.length === 0) return;

        const command = new GroupCommand(this, selectedUUIDs, 'unparent');
        this.historyManager.add(command);
    }

    handleToggleMultipleSelection(enabled) { this.multipleSelectionEnabled = enabled; }
    
    /** Handles clicks detected on objects in the viewport or tree. */
    handleObjectClicked({ object: objectToSelect, shiftKey }) {
        if (!objectToSelect || !this.objects.has(objectToSelect.uuid) || !objectToSelect.userData?.isSelectable) {
            if (!shiftKey && !this.multipleSelectionEnabled) this.clearSelection();
            return;
        }

        const uuid = objectToSelect.uuid;
        const objRef = this.objects.get(uuid);
        const isSelected = this.selectedObjectUUIDs.has(uuid);
        
        const isMultiSelect = shiftKey || this.multipleSelectionEnabled;

        if (isMultiSelect) {
            if (isSelected) {
                this.deselectObject(uuid);
            } else {
                this.selectObject(uuid, false); // Add to selection
            }
        } else {
            // Exclusive selection
            this.selectObject(uuid, true);
        }
    }

    /** Handles clicks on the canvas background. */
    handleCanvasClicked({ shiftKey }) {
        if (!shiftKey && !this.multipleSelectionEnabled) {
            this.clearSelection();
        }
    }

    selectObject(uuid, exclusive = true) {
        if (!this.objects.has(uuid)) return;
        
        let selectionChanged = false;
        let activeChanged = false;
        const object = this.objects.get(uuid);

        if (exclusive) {
            if (this.selectedObjectUUIDs.size !== 1 || !this.selectedObjectUUIDs.has(uuid)) {
                this.clearSelection(false); // Clear internally first
                selectionChanged = true;
            }
        }

        if (!this.selectedObjectUUIDs.has(uuid)) {
             this.selectedObjectUUIDs.add(uuid);
             this.eventEmitter.emit('objectSelected', object);
             selectionChanged = true;
        }

        if (this.activeObjectUUID !== uuid) {
             this.activeObjectUUID = uuid;
             activeChanged = true;
        }

        if (selectionChanged || activeChanged) {
            this.emitSelectionChange();
        }
    }

    deselectObject(uuid) {
        if (this.selectedObjectUUIDs.has(uuid)) {
            const wasActive = this.activeObjectUUID === uuid;
            this.selectedObjectUUIDs.delete(uuid);
            this.eventEmitter.emit('objectDeselected', this.objects.get(uuid));

            if (wasActive) {
                 this.activeObjectUUID = this.selectedObjectUUIDs.size > 0 ? Array.from(this.selectedObjectUUIDs).pop() : null;
            }
            this.emitSelectionChange();
        }
    }

    clearSelection(emitEvent = true) {
        if (this.selectedObjectUUIDs.size === 0) return;
        
        if (emitEvent) {
            const deselectedUUIDs = Array.from(this.selectedObjectUUIDs);
            deselectedUUIDs.forEach(uuid => {
                this.eventEmitter.emit('objectDeselected', this.objects.get(uuid));
            });
        }
        
        this.selectedObjectUUIDs.clear();
        this.activeObjectUUID = null;
        this.emitSelectionChange();
    }
    
    /** Selects all selectable objects in the scene. */
    selectAll() {
        this.objects.forEach(obj => {
            if (obj.userData?.isSelectable && !this.selectedObjectUUIDs.has(obj.uuid)) {
                this.selectedObjectUUIDs.add(obj.uuid);
                this.eventEmitter.emit('objectSelected', obj);
            }
        });
        // Make the last selected object the active one
        this.activeObjectUUID = this.selectedObjectUUIDs.size > 0 ? Array.from(this.selectedObjectUUIDs).pop() : null;
        this.emitSelectionChange();
    }

    emitSelectionChange() {
        const currentSelection = this.getSelectedObjectUUIDs();
        const currentActive = this.activeObjectUUID;
        this.eventEmitter.emit('selectionChanged', currentSelection, currentActive);
    }

    getSelectedObjects() { return Array.from(this.selectedObjectUUIDs).map(uuid => this.objects.get(uuid)).filter(Boolean); }
    getSelectedObjectUUIDs() { return Array.from(this.selectedObjectUUIDs); }
    getObjectsByIds(uuids) { return uuids.map(uuid => this.objects.get(uuid)).filter(Boolean); }
    getObjectByUUID(uuid) { return this.objects.get(uuid); }
    getObjectByName(name) {
        for (const obj of this.objects.values()) { if (obj.name === name) return obj; }
        return this.scene.getObjectByName(name);
    }
    getAllObjects() { return this.scene.children.filter(child => this.objects.has(child.uuid) && child.userData?.isSelectable); }

    focusSelected() {
        const selected = this.getSelectedObjects();
        if (selected.length > 0) {
            const targetObject = this.activeObjectUUID ? this.objects.get(this.activeObjectUUID) : selected[selected.length - 1];
            if (targetObject) {
                 this.eventEmitter.emit('focusOnObjectRequest', targetObject);
            }
        }
    }

}