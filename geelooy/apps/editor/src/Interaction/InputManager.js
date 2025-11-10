// B"H
import * as THREE from 'three';
import { Keybindings } from './Keybindings.js';

/**
 * Handles mouse, touch, and keyboard inputs for selection and interaction.
 */
export class InputManager {
    constructor(domElement, eventEmitter, objectManager, transformManager, camera) {
        this.domElement = domElement;
        this.eventEmitter = eventEmitter;
        this.objectManager = objectManager;
        this.transformManager = transformManager;
        this.camera = camera;

        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.isMouseDown = false;
        this.hasDragged = false;
        this.clickThreshold = 200;
        this.dragThreshold = 5;

        this.mouseDownPosition = new THREE.Vector2();
        this.keysDown = new Set(); // Use a Set to track pressed keys via their `code`

        this.setupEventListeners();
        console.log('B"H\n - InputManager Initialized with new keybindings');
    }

   setupEventListeners() {
        

        // --- Keyboard Listeners ---
        window.addEventListener('keydown', this.onKeyDown.bind(this));
        window.addEventListener('keyup', this.onKeyUp.bind(this));
    }

    updateMouseCoordinates(event) {
        const rect = this.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    }

    onPointerDown(event) {
        if (event.target !== this.domElement) return;

        // Let TransformManager handle its own interactions
        if (this.transformManager.transformControls.axis) {
            this.isMouseDown = true;
            return;
        }

        this.isMouseDown = true;
        this.hasDragged = false;
        this.mouseDownPosition.set(event.clientX, event.clientY);
    }

    onPointerMove(event) {
        if (!this.isMouseDown) return;

        const currentPosition = new THREE.Vector2(event.clientX, event.clientY);
        if (!this.hasDragged && currentPosition.distanceTo(this.mouseDownPosition) > this.dragThreshold) {
            this.hasDragged = true;
        }
    }

    onPointerUp(event) {
        if (!this.isMouseDown) return;
        
        const wasDraggingGizmo = this.transformManager.isDragging;
        const isRelevantTarget = event.target === this.domElement || wasDraggingGizmo;

        if (isRelevantTarget && !this.hasDragged && !wasDraggingGizmo) {
            this.updateMouseCoordinates(event);
            this.performRaycastSelection(event.shiftKey); // Pass shift key state
        }

        this.isMouseDown = false;
        this.hasDragged = false;
    }

    performRaycastSelection(isShiftKey) {
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        // Raycast against all selectable objects
        const objectsToCheck = Array.from(this.objectManager.objects.values())
            .filter(obj => obj.userData?.isSelectable && obj.visible && !obj.userData?.isOutline && (obj.isMesh || obj.isLine || obj.isPoints));
            
        const intersects = this.raycaster.intersectObjects(objectsToCheck, true); // recursive check

        if (intersects.length > 0) {
            let selectedObject = null;
            for (const intersect of intersects) {
                let obj = intersect.object;
                // Traverse up to find the root selectable object
                while (obj && !obj.userData?.isSelectable) {
                    obj = obj.parent;
                }
                if (obj && obj.userData?.isSelectable) {
                    selectedObject = obj;
                    break;
                }
            }

            if (selectedObject) {
                // Emit with shiftKey status
                this.eventEmitter.emit('objectClicked', { object: selectedObject, shiftKey: isShiftKey });
            } else {
                this.eventEmitter.emit('canvasClicked', { shiftKey: isShiftKey });
            }
        } else {
            // Clicked on empty space
            this.eventEmitter.emit('canvasClicked', { shiftKey: isShiftKey });
        }
    }

    onKeyDown(event) {
        // Prevent browser shortcuts (e.g., Ctrl+S, Ctrl+A) if they match our bindings
        if (event.ctrlKey || event.metaKey || event.altKey) {
            for (const action in Keybindings) {
                const binding = Keybindings[action];
                if (binding.code === event.code) {
                    event.preventDefault();
                    break;
                }
            }
        }
        
        // Ignore events if typing in an input field
        const target = event.target;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
            // Allow Backspace and Delete in inputs
            if (event.code === 'Backspace' || event.code === 'Delete') return;
             // Allow undo/redo in text fields
            if (this.checkBinding(event, Keybindings.HISTORY_UNDO) || this.checkBinding(event, Keybindings.HISTORY_REDO)) return;
            // Block others
            if (target.type !== 'checkbox' && target.type !== 'radio') return;
        }

        this.keysDown.add(event.code);
        this.handleKeybinding(event);
    }

    onKeyUp(event) {
        this.keysDown.delete(event.code);
    }
    
    // Checks an event against a keybinding definition
    checkBinding(event, binding) {
        if (!binding) return false;
        const meta = event.ctrlKey || event.metaKey;
        return binding.code === event.code &&
               (binding.ctrlKey || false) === meta &&
               (binding.shiftKey || false) === event.shiftKey &&
               (binding.altKey || false) === event.altKey;
    }

    handleKeybinding(event) {
        // History
        if (this.checkBinding(event, Keybindings.HISTORY_UNDO)) this.eventEmitter.emit('undoRequest');
        if (this.checkBinding(event, Keybindings.HISTORY_REDO) || this.checkBinding(event, Keybindings.HISTORY_REDO_ALT)) this.eventEmitter.emit('redoRequest');
        
        // Transform
        if (this.checkBinding(event, Keybindings.TRANSFORM_MODE_TRANSLATE)) this.eventEmitter.emit('setTransformMode', 'translate');
        if (this.checkBinding(event, Keybindings.TRANSFORM_MODE_ROTATE)) this.eventEmitter.emit('setTransformMode', 'rotate');
        if (this.checkBinding(event, Keybindings.TRANSFORM_MODE_SCALE)) this.eventEmitter.emit('setTransformMode', 'scale');
        
        // View
        if (this.checkBinding(event, Keybindings.VIEW_FOCUS_SELECTED) || this.checkBinding(event, Keybindings.VIEW_FOCUS_SELECTED_ALT)) this.eventEmitter.emit('focusSelectedRequest');
        
        // Object Manipulation
        if (this.checkBinding(event, Keybindings.OBJECT_DELETE) || this.checkBinding(event, Keybindings.OBJECT_DELETE_ALT)) this.eventEmitter.emit('deleteSelectedRequest');
        if (this.checkBinding(event, Keybindings.OBJECT_ADD_PRIMITIVE)) {
            // Get selected primitive from toolbar to add
            const selectEl = document.getElementById('select-primitive');
            const type = selectEl ? selectEl.value : 'Box';
            this.eventEmitter.emit('createPrimitiveRequest', type);
        }
        
        // Selection
        if (this.checkBinding(event, Keybindings.SELECTION_ALL)) this.objectManager.selectAll();
        if (this.checkBinding(event, Keybindings.SELECTION_NONE)) this.objectManager.clearSelection();
        
        // Parenting
        if (this.checkBinding(event, Keybindings.PARENT_SET)) this.eventEmitter.emit('groupSelectedRequest');
        if (this.checkBinding(event, Keybindings.PARENT_CLEAR)) this.eventEmitter.emit('ungroupSelectedRequest');
    }
    
     handlePointerDown(event) {
        // If the gizmo is being dragged, let it do its thing.
        if (this.transformManager.isDragging || this.transformManager.transformControls.axis) {
            return;
        }

        // Perform the object selection raycast.
        this.updateMouseCoordinates(event);
        this.performRaycastSelection(event.shiftKey);
    }
}