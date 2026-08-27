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
        
        const objectsToCheck = Array.from(this.objectManager.objects.values())
            .filter(obj => obj.userData?.isSelectable && obj.visible && !obj.userData?.isOutline && (obj.isMesh || obj.isLine || obj.isPoints));
            
        const intersects = this.raycaster.intersectObjects(objectsToCheck, true);

        if (intersects.length > 0) {
            let selectedObject = null;
            for (const intersect of intersects) {
                let obj = intersect.object;
                while (obj && !obj.userData?.isSelectable) {
                    obj = obj.parent;
                }
                if (obj && obj.userData?.isSelectable) {
                    selectedObject = obj;
                    break;
                }
            }

            if (selectedObject) {
                this.eventEmitter.emit('objectClicked', { object: selectedObject, shiftKey: isShiftKey });
            } else {
                this.eventEmitter.emit('canvasClicked', { shiftKey: isShiftKey });
            }
        } else {
            this.eventEmitter.emit('canvasClicked', { shiftKey: isShiftKey });
        }
    }

    onKeyDown(event) {
        if (event.ctrlKey || event.metaKey || event.altKey) {
            for (const action in Keybindings) {
                const binding = Keybindings[action];
                if (binding.code === event.code) {
                    event.preventDefault();
                    break;
                }
            }
        }
        
        const target = event.target;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
            if (event.code === 'Backspace' || event.code === 'Delete') return;
            if (this.checkBinding(event, Keybindings.HISTORY_UNDO) || this.checkBinding(event, Keybindings.HISTORY_REDO)) return;
            if (target.type !== 'checkbox' && target.type !== 'radio') return;
        }

        this.keysDown.add(event.code);
        this.handleKeybinding(event);
    }

    onKeyUp(event) {
        this.keysDown.delete(event.code);
    }
    
    checkBinding(event, binding) {
        if (!binding) return false;
        const meta = event.ctrlKey || event.metaKey;
        return binding.code === event.code &&
               (binding.ctrlKey || false) === meta &&
               (binding.shiftKey || false) === event.shiftKey &&
               (binding.altKey || false) === event.altKey;
    }

    handleKeybinding(event) {
        // B"H: Special handling for edit mode keys
        if (window.MWA && window.MWA.appMode === 'EDIT') {
            if (this.checkBinding(event, Keybindings.EDIT_SELECT_ALL)) {
                this.eventEmitter.emit('editModeSelectAllRequest');
                return; // Consume the event
            }
            if (this.checkBinding(event, Keybindings.EDIT_MODE_SELECT_VERTEX)) {
                this.eventEmitter.emit('setEditSelectionMode', 'VERTEX');
                return;
            }
            if (this.checkBinding(event, Keybindings.EDIT_MODE_SELECT_EDGE)) {
                this.eventEmitter.emit('setEditSelectionMode', 'EDGE');
                return;
            }
            if (this.checkBinding(event, Keybindings.EDIT_MODE_SELECT_FACE)) {
                this.eventEmitter.emit('setEditSelectionMode', 'FACE');
                return;
            }
        }
        
        if (this.checkBinding(event, Keybindings.TOGGLE_EDIT_MODE)) {
            event.preventDefault();
            this.eventEmitter.emit('toggleEditModeRequest');
        }

        if (this.checkBinding(event, Keybindings.HISTORY_UNDO)) this.eventEmitter.emit('undoRequest');
        if (this.checkBinding(event, Keybindings.HISTORY_REDO) || this.checkBinding(event, Keybindings.HISTORY_REDO_ALT)) this.eventEmitter.emit('redoRequest');
        
        if (this.checkBinding(event, Keybindings.TRANSFORM_MODE_TRANSLATE)) this.eventEmitter.emit('setTransformMode', 'translate');
        if (this.checkBinding(event, Keybindings.TRANSFORM_MODE_ROTATE)) this.eventEmitter.emit('setTransformMode', 'rotate');
        if (this.checkBinding(event, Keybindings.TRANSFORM_MODE_SCALE)) this.eventEmitter.emit('setTransformMode', 'scale');
        
        if (this.checkBinding(event, Keybindings.VIEW_FOCUS_SELECTED) || this.checkBinding(event, Keybindings.VIEW_FOCUS_SELECTED_ALT)) this.eventEmitter.emit('focusSelectedRequest');
        
        if (this.checkBinding(event, Keybindings.OBJECT_DELETE) || this.checkBinding(event, Keybindings.OBJECT_DELETE_ALT)) this.eventEmitter.emit('deleteSelectedRequest');
        if (this.checkBinding(event, Keybindings.OBJECT_ADD_PRIMITIVE)) {
            const selectEl = document.getElementById('select-primitive');
            const type = selectEl ? selectEl.value : 'Box';
            this.eventEmitter.emit('createPrimitiveRequest', type);
        }
        
        if (this.checkBinding(event, Keybindings.SELECTION_ALL)) this.objectManager.selectAll();
        if (this.checkBinding(event, Keybindings.SELECTION_NONE)) this.objectManager.clearSelection();
        
        if (this.checkBinding(event, Keybindings.PARENT_SET)) this.eventEmitter.emit('groupSelectedRequest');
        if (this.checkBinding(event, Keybindings.PARENT_CLEAR)) this.eventEmitter.emit('ungroupSelectedRequest');
    }
    
     handlePointerDown(event) {
        if (this.transformManager.isDragging || this.transformManager.transformControls.axis) {
            return;
        }
        this.updateMouseCoordinates(event);
        this.performRaycastSelection(event.shiftKey);
    }
}