// B"H
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Utils } from '../Core/Utils.js'; // Assuming Utils.js exists and has generateUniqueName
import { CreateObjectCommand } from '../History/Commands/CreateObjectCommand.js';
import { RemoveObjectCommand } from '../History/Commands/RemoveObjectCommand.js';
import { GroupCommand } from '../History/Commands/GroupCommand.js';

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
        this.multipleSelectionEnabled = false;

        // --- Register Event Listeners ---
        // Ensure all methods referenced here exist in the class!
        this.eventEmitter.on('createPrimitiveRequest', this.createPrimitive.bind(this));
        this.eventEmitter.on('loadGLBRequest', this.loadGLB.bind(this));
        this.eventEmitter.on('deleteSelectedRequest', this.deleteSelectedObjects.bind(this));
        this.eventEmitter.on('groupSelectedRequest', this.groupSelectedObjectsAsParentChild.bind(this)); // Use parent/child grouping
        this.eventEmitter.on('ungroupSelectedRequest', this.ungroupSelectedObjectFromParent.bind(this)); // Use parent/child ungrouping
        this.eventEmitter.on('toggleMultipleSelection', this.handleToggleMultipleSelection.bind(this));
        this.eventEmitter.on('objectClicked', this.handleObjectClicked.bind(this));
        this.eventEmitter.on('canvasClicked', this.handleCanvasClicked.bind(this));
        this.eventEmitter.on('focusSelectedRequest', this.focusSelected.bind(this));
        // Optional: Listen for rename requests if PropertiesPanel emits them
        // this.eventEmitter.on('renameObjectRequest', ({ uuid, newName }) => this.renameObject(uuid, newName));

        console.log("B\"H - ObjectManager Initialized");
    }

    // --- Internal Scene/State Manipulation Methods (Called by Commands/Self) ---
    // These methods modify the scene/state directly and DO NOT interact with HistoryManager

    /**
     * Adds an object to the scene/map. Optionally emits events.
     * @param {THREE.Object3D} object
     * @param {THREE.Object3D} parent
     * @param {boolean} selectable
     * @param {boolean} emitEvents - If true, emits objectAdded and sceneGraphChanged. Defaults to true.
     * @returns {THREE.Object3D | null}
     */
    _addObjectInternal(object, parent = this.scene, selectable = true, emitEvents = true) { // Added emitEvents flag
        if (!object || !object.uuid) {
            console.error("B\"H ObjectManager: _addObjectInternal - Invalid object.", object);
            return null;
        }
        // Check if already managed (e.g., during undo/redo)
        if (this.objects.has(object.uuid)) {
             console.warn(`B"H ObjectManager: _addObjectInternal - Object ${object.uuid} already managed.`);
             // If re-adding, ensure parent is correct
             if (object.parent !== parent) {
                 parent.add(object); // Use standard add for reparenting
             }
             // Update selectability in case it changed (though unlikely here)
             object.userData.isSelectable = selectable;
             return object; // Return existing object
        }

        // Proceed with adding a new object
        if (!object.name) {
            let baseName = object.userData?.type || object.type || 'Object';
            if (object.isGroup) baseName = 'Group';
            object.name = Utils.generateUniqueName(baseName, (name) => this.getObjectByName(name));
        }
        object.userData = object.userData || {};
        object.userData.isSelectable = selectable;

        this.objects.set(object.uuid, object);
        parent.add(object); // Add to THREE scene graph
        console.log(`B"H ObjectManager: _addObjectInternal - Added ${object.name} (${object.uuid}) to ${parent.name || 'Scene'}`);

        // Recursively add children to map if not already managed
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
                      // console.log(`B"H ObjectManager: _addObjectInternal - Added child ${child.name} (${child.uuid}) to map.`);
                }
            }
        });

        // *** Conditional Event Emission ***
        if (emitEvents) {
             console.log(`B"H _addObjectInternal emitting objectAdded/sceneGraphChanged for ${object.name}`);
             this.eventEmitter.emit('objectAdded', object);
             this.eventEmitter.emit('sceneGraphChanged');
        } else {
             console.log(`B"H _addObjectInternal *not* emitting events for ${object.name} (emitEvents=false)`);
        }

        return object;
    }

    /**
     * Removes an object from the scene and internal map. Handles children in map.
     * Returns the removed object (needed for Command undo). Does NOT dispose geometry/material here.
     * @param {string} objectUUID - The UUID of the object to remove.
     * @returns {THREE.Object3D | null} The removed object or null if not found.
     */
    _removeObjectInternal(objectUUID) {
        const object = this.objects.get(objectUUID);
        if (!object) {
            console.warn(`B"H ObjectManager: _removeObjectInternal - Object ${objectUUID} not found.`);
            return null;
        }

        const wasSelected = this.selectedObjectUUIDs.has(objectUUID);
        const wasActive = this.activeObjectUUID === objectUUID;

        // Recursively remove children from map FIRST
         const childrenToRemoveUUIDs = [];
         object.traverse((child) => {
             if (child !== object && this.objects.has(child.uuid)) {
                 childrenToRemoveUUIDs.push(child.uuid);
             }
         });
         // Remove children from map
          childrenToRemoveUUIDs.forEach(childUUID => {
              this.objects.delete(childUUID);
              this.selectedObjectUUIDs.delete(childUUID); // Ensure children deselected
          });

        // Remove main object from parent and map
        object.removeFromParent();
        this.objects.delete(objectUUID);
        this.selectedObjectUUIDs.delete(objectUUID); // Ensure main deselected

        // Reset active object if it was the one removed
        if (wasActive) {
             this.activeObjectUUID = null;
             // Activate next selected? Or leave null? Leave null for now.
        }

        console.log(`B"H ObjectManager: _removeObjectInternal - Removed ${object.name} (${objectUUID}) from scene/map`);

        // --- IMPORTANT ---
        // DO NOT dispose geometry/material here. The RemoveObjectCommand's
        // execute method should handle disposal AFTER the object state is captured for undo.
        // The command's undo method will need the intact object to re-add it.

        // Emit events AFTER command execution, or if called directly with executeCommand=false
        // if (!executeCommand) { ... } // (Logic moved out for clarity)

        return object; // Return the removed object reference
    }

    /**
     * Internal logic to parent objects under another. Uses attach().
     * @param {string} parentUUID
     * @param {string[]} childUUIDs
     * @returns {object} { success: boolean, originalParents: object }
     */
    _reparentObjectsInternal(parentUUID, childUUIDs) {
        const parentObject = this.objects.get(parentUUID);
        if (!parentObject) {
            console.error(`B"H: Cannot reparent, parent object ${parentUUID} not found.`);
            return { success: false, originalParents: {} };
        }

        const childrenToReparent = childUUIDs.map(uuid => this.objects.get(uuid)).filter(Boolean);
        if (childrenToReparent.length === 0) {
             console.warn(`B"H: No valid child objects found to reparent.`);
             return { success: false, originalParents: {} };
        }

        if (childUUIDs.includes(parentUUID)) {
             console.error("B\"H: Cannot parent an object to itself.");
             return { success: false, originalParents: {} };
        }
        // TODO: Add descendant check

        const originalParents = {}; // Store { childUUID: originalParentUUID } for undo
        let success = true;

        childrenToReparent.forEach(child => {
            if (child.parent) {
                 originalParents[child.uuid] = child.parent.uuid;
                 try {
                    parentObject.attach(child); // Use attach to preserve world transform
                    console.log(`B"H: Attached ${child.name} to ${parentObject.name}`);
                 } catch(e) {
                     console.error(`B"H: Error attaching ${child.name} to ${parentObject.name}:`, e);
                     success = false;
                 }
            } else {
                console.error(`B"H: Child object ${child.name} has no parent.`);
                success = false;
            }
        });

        // Commands should handle event emission after successful execute/undo
        // if (success) { this.eventEmitter.emit('sceneGraphChanged'); }

        return { success, originalParents };
    }

    /**
     * Internal logic to move objects from their current parent to their grandparent (or scene). Uses attach().
     * @param {string[]} childUUIDs
     * @returns {object} { success: boolean, originalParents: object }
     */
    _unparentObjectsInternal(childUUIDs) {
        const childrenToUnparent = childUUIDs.map(uuid => this.objects.get(uuid)).filter(Boolean);
        if (childrenToUnparent.length === 0) {
             console.warn(`B"H: No valid objects found to unparent.`);
             return { success: false, originalParents: {} };
        }

        const originalParents = {}; // Store { childUUID: originalParentUUID } for redo
        let success = true;
        const targetParentCache = new Map();

        childrenToUnparent.forEach(child => {
            const currentParent = child.parent;
            if (!currentParent) { // Already at root (or detached somehow)
                 console.warn(`B"H: Object ${child.name} has no parent to unparent from.`);
                 originalParents[child.uuid] = null; // Or scene UUID? Need consistency. Let's use scene.
                 originalParents[child.uuid] = this.scene.uuid;
                 return; // Skip attach
            }

            originalParents[child.uuid] = currentParent.uuid; // Store parent it's being removed from

            if (currentParent === this.scene) { // Already at scene root
                 console.warn(`B"H: Object ${child.name} is already at the scene root.`);
                 return; // Skip attach
            }

            // Determine target parent (grandparent or scene)
            const grandParent = currentParent.parent || this.scene;
            let targetParent = targetParentCache.get(grandParent.uuid);
            if (!targetParent) {
                targetParent = grandParent;
                targetParentCache.set(grandParent.uuid, targetParent);
            }

            try {
                 targetParent.attach(child);
                 console.log(`B"H: Attached ${child.name} to ${targetParent.name || 'Scene'}`);
            } catch(e) {
                console.error(`B"H: Error attaching ${child.name} to ${targetParent.name || 'Scene'}:`, e);
                success = false;
            }
        });

        // Commands should handle event emission
        // if (success) { this.eventEmitter.emit('sceneGraphChanged'); }

         return { success, originalParents };
    }

    // --- Public Methods (Create Commands for History) ---

    /** Creates a primitive mesh and adds it via a command. */
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

        const material = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7, metalness: 0.1, side: THREE.DoubleSide });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(position);
        mesh.userData.type = type; // Store specific primitive type

        // Create command - DO NOT add object here, command's execute will call _addObjectInternal
        const command = new CreateObjectCommand(this, mesh, this.scene.uuid);
        this.historyManager.add(command);

        // Select AFTER command execution (assuming sync for now)
        this.selectObject(mesh.uuid, true);
        console.log(`B"H ObjectManager: Queued CreateObjectCommand for ${type}`);
        return mesh; // Return mesh reference (may not be in scene immediately if history is async)
    }

    /** Loads a GLB model via a command. */
    async loadGLB(url, position = new THREE.Vector3(0, 0, 0)) {
        try {
            const gltf = await this.gltfLoader.loadAsync(url);
            const object = gltf.scene;
            object.position.copy(position);
            object.userData.type = 'GLB';
            object.userData.sourceUrl = url;

            // Prepare children before command creation (names, selectability)
            object.traverse((child) => {
                 if (child.isMesh || child.isLight || child.isCamera || child.isGroup) {
                     child.userData = child.userData || {};
                     child.userData.isSelectable = true;
                     if (!child.name) {
                         let childBase = child.type || 'Child';
                         child.name = Utils.generateUniqueName(childBase, (name) => this.getObjectByName(name));
                     }
                 }
            });
             object.userData.isSelectable = true; // Ensure root is selectable
             if (!object.name) object.name = Utils.generateUniqueName('GLB_Model', (name) => this.getObjectByName(name));

            // Create command
            const command = new CreateObjectCommand(this, object, this.scene.uuid);
            this.historyManager.add(command);

            // Select after command execution
            this.selectObject(object.uuid, true);
            console.log("B\"H ObjectManager: Queued CreateObjectCommand for GLB:", object.name);
            return object;

        } catch (error) {
            console.error('B"H - Error loading GLB:', error);
            this.eventEmitter.emit('error', `Failed to load GLB: ${error.message || error}`);
            return null;
        } finally {
             if (url.startsWith('blob:')) { // Clean up blob URLs
                 URL.revokeObjectURL(url);
             }
        }
    }

    /** Deletes selected objects via commands. */
    deleteSelectedObjects() {
        const uuidsToRemove = Array.from(this.selectedObjectUUIDs);
        if (uuidsToRemove.length === 0) return;

        console.log("B\"H ObjectManager: Queuing deletion commands for:", uuidsToRemove);
        const objectsToRemove = uuidsToRemove.map(uuid => this.objects.get(uuid)).filter(Boolean);

        // Create a RemoveObjectCommand for each object
        objectsToRemove.forEach(obj => {
            const parentUUID = obj.parent?.uuid;
            // Pass the actual object reference to the command for potential undo
            const command = new RemoveObjectCommand(this, obj, parentUUID);
            this.historyManager.add(command);
            // The command's execute method will call _removeObjectInternal(obj.uuid)
            // and handle disposal/event emission
        });

        // Selection should be cleared as commands execute and call _removeObjectInternal
    }

    /** Groups selected objects by parenting them under the active object. */
    groupSelectedObjectsAsParentChild() {
        const selectedUUIDs = this.getSelectedObjectUUIDs();
        const activeUUID = this.activeObjectUUID;

        if (selectedUUIDs.length < 2) { console.warn("B\"H: Need at least two objects selected to parent."); return; }
        if (!activeUUID || !this.selectedObjectUUIDs.has(activeUUID)) { console.warn("B\"H: Cannot parent - no active object in selection."); return; }

        const childUUIDs = selectedUUIDs.filter(uuid => uuid !== activeUUID);
        const parentUUID = activeUUID;
        if (childUUIDs.length === 0) { console.warn("B\"H: No child objects selected to parent to the active object."); return; }

        console.log(`B"H: Queuing GroupCommand (parent): Parent=${parentUUID}, Children=[${childUUIDs.join(', ')}]`);
        const command = new GroupCommand(this, selectedUUIDs, 'parent', parentUUID); // Pass all selected, action, and target parent
        this.historyManager.add(command);
    }

    /** Ungroups selected objects by moving them to their grandparent (or scene). */
    ungroupSelectedObjectFromParent() {
        const selectedUUIDs = this.getSelectedObjectUUIDs();
        if (selectedUUIDs.length === 0) { console.warn("B\"H: Nothing selected to ungroup from parent."); return; }

        console.log("B\"H: Queuing GroupCommand (unparent) for:", selectedUUIDs);
        const command = new GroupCommand(this, selectedUUIDs, 'unparent'); // Pass children to unparent
        this.historyManager.add(command);
    }

    // TODO: Implement renameObject using a RenameCommand
    // renameObject(uuid, newName) { ... }

    // --- Selection ---

    /** Handles the toggle state change from the UI. */
    handleToggleMultipleSelection(enabled) {
         this.multipleSelectionEnabled = enabled;
         let selectionChanged = false;
         let activeChanged = false;

         if (!enabled && this.selectedObjectUUIDs.size > 1) {
            // When disabling multi-select, keep only the active object selected
            const currentActive = this.activeObjectUUID;
            const previouslySelectedUUIDs = Array.from(this.selectedObjectUUIDs);
            this.selectedObjectUUIDs.clear(); // Clear all first

            if (currentActive && previouslySelectedUUIDs.includes(currentActive)) {
                 this.selectedObjectUUIDs.add(currentActive); // Re-add only the active one
                 this.activeObjectUUID = currentActive; // Ensure it's still active
            } else {
                 this.activeObjectUUID = null; // No selection left if active wasn't in the list somehow
            }
            selectionChanged = true; // Selection definitely changed

            // Emit deselect for others that were removed
            previouslySelectedUUIDs.forEach(uuid => {
                if (!this.selectedObjectUUIDs.has(uuid)) {
                    this.eventEmitter.emit('objectDeselected', this.objects.get(uuid));
                }
            });
         }
         // Only emit if state actually changed
         if (selectionChanged || activeChanged) { // activeChanged is implicitly handled by selectionChanged here
             this.emitSelectionChange();
         }
    }

    /** Handles clicks detected on objects in the viewport or tree. */
     handleObjectClicked(objectToSelect) {
        console.log("B\"H handleObjectClicked received:", objectToSelect?.name);
        if (!objectToSelect || !this.objects.has(objectToSelect.uuid) || !objectToSelect.userData?.isSelectable) {
            console.log("B\"H Clicked object not selectable/managed:", objectToSelect?.name);
            if (!this.multipleSelectionEnabled) this.clearSelection();
            return;
        }

        const uuid = objectToSelect.uuid;
        const objRef = this.objects.get(uuid);
        const isSelected = this.selectedObjectUUIDs.has(uuid);
        let selectionActuallyChanged = false;
        let activeActuallyChanged = false;

        if (this.multipleSelectionEnabled) {
            if (isSelected) {
                if (this.activeObjectUUID !== uuid) {
                     this.activeObjectUUID = uuid;
                     activeActuallyChanged = true;
                }
            } else {
                this.selectedObjectUUIDs.add(uuid);
                this.eventEmitter.emit('objectSelected', objRef);
                this.activeObjectUUID = uuid;
                selectionActuallyChanged = true;
                activeActuallyChanged = true;
            }
        } else {
            if (!isSelected || this.selectedObjectUUIDs.size > 1) {
                 const previouslySelectedUUIDs = Array.from(this.selectedObjectUUIDs);
                 this.selectedObjectUUIDs.clear();
                 previouslySelectedUUIDs.forEach(prevUUID => {
                     if (prevUUID !== uuid) {
                         this.eventEmitter.emit('objectDeselected', this.objects.get(prevUUID));
                     }
                 });

                 this.selectedObjectUUIDs.add(uuid);
                 this.eventEmitter.emit('objectSelected', objRef);
                 this.activeObjectUUID = uuid;
                 selectionActuallyChanged = true;
                 activeActuallyChanged = true;
            }
             else if (isSelected && this.selectedObjectUUIDs.size === 1 && this.activeObjectUUID !== uuid) {
                 this.activeObjectUUID = uuid;
                 activeActuallyChanged = true;
             }
        }

        if (selectionActuallyChanged || activeActuallyChanged) {
            this.emitSelectionChange();
        }
    }

    /** Handles clicks on the canvas background. */
    handleCanvasClicked() {
        // Deselect only if not in multi-select mode
        if (!this.multipleSelectionEnabled) {
            this.clearSelection();
        }
    }

    /**
     * Programmatically selects an object, optionally clearing previous selections.
     * Ensures 'selectionChanged' event is emitted only if the final state differs.
     * @param {string} uuid - UUID of the object to select.
     * @param {boolean} exclusive - If true, clears previous selection.
     */
    selectObject(uuid, exclusive = true) {
        if (!this.objects.has(uuid)) {
            console.warn(`B"H selectObject: Cannot select non-managed object ${uuid}`);
            return;
        }
        const object = this.objects.get(uuid);
        let selectionActuallyChanged = false;
        let activeActuallyChanged = false;

        const previousSelectionSize = this.selectedObjectUUIDs.size;
        const previousActiveUUID = this.activeObjectUUID;

        // Store which objects were deselected if clearing happens
        const deselectedUUIDs = [];

        if (exclusive) {
            // Determine if clearing is actually needed and will change the state
            if (this.selectedObjectUUIDs.size > 1 || (this.selectedObjectUUIDs.size === 1 && !this.selectedObjectUUIDs.has(uuid))) {
                Array.from(this.selectedObjectUUIDs).forEach(prevUUID => {
                    if (prevUUID !== uuid) {
                        deselectedUUIDs.push(prevUUID); // Store UUIDs being deselected
                    }
                });
                this.selectedObjectUUIDs.clear();
                // Note: selectionActuallyChanged flag will be set below when adding the new one
            }
        }

        // Add the new object if it's not already selected
        if (!this.selectedObjectUUIDs.has(uuid)) {
             this.selectedObjectUUIDs.add(uuid);
             // Don't set selectionActuallyChanged flag here yet, compare final state
             this.eventEmitter.emit('objectSelected', object); // Emit specific select event
        }

        // Make the selected object the active object
        if (this.activeObjectUUID !== uuid) {
             this.activeObjectUUID = uuid;
             activeActuallyChanged = true; // Active state definitely changed
        }

        // Determine if the overall selection set has changed
        if (this.selectedObjectUUIDs.size !== previousSelectionSize || !this.selectedObjectUUIDs.has(uuid) || deselectedUUIDs.length > 0) {
            // A simple check could be comparing the new set to the old one, but tracking deselected is clear
            selectionActuallyChanged = true;
        }

        // Emit individual deselect events for those cleared during exclusive selection
        deselectedUUIDs.forEach(deselectedUUID => {
            this.eventEmitter.emit('objectDeselected', this.objects.get(deselectedUUID));
        });

        // Emit the consolidated selection change event ONLY if selection or active state changed
        if (selectionActuallyChanged || activeActuallyChanged) {
            this.emitSelectionChange();
        } else {
            console.log(`B"H selectObject: Called for ${uuid}, but no state change detected.`);
        }
    }

    /** Programmatically deselects an object. */
    deselectObject(uuid) {
        if (this.selectedObjectUUIDs.has(uuid)) {
            const object = this.objects.get(uuid);
            const wasActive = this.activeObjectUUID === uuid;
            this.selectedObjectUUIDs.delete(uuid);
            this.eventEmitter.emit('objectDeselected', object);

            let activeChanged = false;
            if (wasActive) {
                 // Make last remaining selected object active, or null if none left
                 this.activeObjectUUID = this.selectedObjectUUIDs.size > 0 ? Array.from(this.selectedObjectUUIDs).pop() : null;
                 activeChanged = true;
            }
            // Always emit selection change on deselect
            this.emitSelectionChange();
        }
    }

    /** Clears the entire selection. */
    clearSelection(emitEvent = true) {
        const deselectedUUIDs = Array.from(this.selectedObjectUUIDs);
        const wasActive = this.activeObjectUUID !== null; // Check if anything was active
        let selectionChanged = false;
        let activeChanged = false;

        if (deselectedUUIDs.length > 0) {
            this.selectedObjectUUIDs.clear();
            selectionChanged = true;
            if (wasActive) { // If selection is cleared, active must be cleared too
                this.activeObjectUUID = null;
                activeChanged = true;
            }

            if (emitEvent) {
                 deselectedUUIDs.forEach(uuid => {
                     this.eventEmitter.emit('objectDeselected', this.objects.get(uuid));
                 });
            }
        }
        // Only emit if selection or active state actually changed
        if (selectionChanged || activeChanged) {
             this.emitSelectionChange();
        }
    }

    /** Emits the 'selectionChanged' event with current selection and active object. */
    /** Emits the 'selectionChanged' event with current selection and active object. */
    emitSelectionChange() {
        // Create copies of the state to emit
        const currentSelection = this.getSelectedObjectUUIDs(); // Gets a fresh array copy
        const currentActive = this.activeObjectUUID;
        console.log(`>>> B"H Emitting selectionChanged: Selected [${currentSelection.join(', ')}], Active: ${currentActive || 'None'}`);
        // Emit the copies
        this.eventEmitter.emit('selectionChanged', currentSelection, currentActive);
    }

    // --- Getters ---

    getSelectedObjects() { return Array.from(this.selectedObjectUUIDs).map(uuid => this.objects.get(uuid)).filter(Boolean); }
    getSelectedObjectUUIDs() { return Array.from(this.selectedObjectUUIDs); } // Return array copy
    getObjectsByIds(uuids) { return uuids.map(uuid => this.objects.get(uuid)).filter(Boolean); }
    getObjectByUUID(uuid) { return this.objects.get(uuid); }
    getObjectByName(name) {
        for (const obj of this.objects.values()) { if (obj.name === name) return obj; }
        return this.scene.getObjectByName(name); // Fallback to scene search
    }
    /** Returns top-level objects managed by this manager. */
    getAllObjects() {
        return this.scene.children.filter(child => this.objects.has(child.uuid) && child.userData?.isSelectable);
    }

    // --- Focus ---
    focusSelected() {
        const selected = this.getSelectedObjects();
        if (selected.length > 0) {
            // Focus on the active object if available, otherwise the last selected
            const targetObject = this.activeObjectUUID ? this.objects.get(this.activeObjectUUID) : selected[selected.length - 1];
            if (targetObject) {
                 this.eventEmitter.emit('focusOnObjectRequest', targetObject);
            }
        }
    }

} // End of ObjectManager class