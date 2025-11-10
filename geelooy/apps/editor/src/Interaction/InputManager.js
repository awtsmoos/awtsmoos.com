// B"H
import * as THREE from 'three';

/**
 * Handles mouse, touch, and potentially keyboard inputs for selection and interaction.
 */
export class InputManager {
    constructor(domElement, eventEmitter, objectManager, transformManager, camera) {
        this.domElement = domElement;
        this.eventEmitter = eventEmitter;
        this.objectManager = objectManager; // To access objects for raycasting
        this.transformManager = transformManager; // To check if gizmo is active
        this.camera = camera;

        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.isMouseDown = false;
        this.hasDragged = false;
        this.mouseDownTime = 0;
        this.clickThreshold = 200; // Max time (ms) for a click vs hold
        this.dragThreshold = 5; // Pixels moved before considered drag

        this.mouseDownPosition = new THREE.Vector2();
        this.orbitControlsEnabled = true; // Assume enabled initially

        this.setupEventListeners();
        console.log("B\"H - InputManager Initialized");
    }

    setupEventListeners() {
        this.domElement.addEventListener('pointerdown', this.onPointerDown.bind(this), false);
        this.domElement.addEventListener('pointermove', this.onPointerMove.bind(this), false);
        this.domElement.addEventListener('pointerup', this.onPointerUp.bind(this), false);
        // Optional: Add keyboard listeners here if needed
        // window.addEventListener('keydown', this.onKeyDown.bind(this));
        // window.addEventListener('keyup', this.onKeyUp.bind(this));
        this.eventEmitter.on('orbitControlsEnable', this.onOrbitControlsEnable.bind(this)); // Listen to transform manager
    }

    onOrbitControlsEnable(enabled) {
        this.orbitControlsEnabled = enabled;
    }

    updateMouseCoordinates(event) {
        const rect = this.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    }

    onPointerDown(event) {
        if (event.target !== this.domElement) {
            return; // Ignore UI clicks
        }

        // Check if the click is on the transform controls gizmo *axis*
        if (this.transformManager.transformControls.axis) {
             this.isMouseDown = true;
             this.hasDragged = false;
             this.mouseDownTime = Date.now();
             this.mouseDownPosition.set(event.clientX, event.clientY);
             // Let TransformManager handle the interaction, don't raycast here
             return;
        }

        this.isMouseDown = true;
        this.hasDragged = false;
        this.mouseDownTime = Date.now();
        this.updateMouseCoordinates(event);
        this.mouseDownPosition.set(event.clientX, event.clientY);
    }

    onPointerMove(event) {
        if (!this.isMouseDown) return;

        const currentPosition = new THREE.Vector2(event.clientX, event.clientY);
        if (!this.hasDragged) {
            const distance = currentPosition.distanceTo(this.mouseDownPosition);
            if (distance > this.dragThreshold) {
                this.hasDragged = true;
            }
        }
    }

    onPointerUp(event) {
        if (!this.isMouseDown) return;

        // Allow finishing drag even if pointer up is outside canvas
        const wasDraggingGizmo = this.transformManager.isDragging; // Check *before* TransformManager handles mouseUp

        // Check if the mouseup target is relevant (canvas or during gizmo drag)
        const isRelevantTarget = event.target === this.domElement || wasDraggingGizmo;
        if (!isRelevantTarget) {
             this.isMouseDown = false;
             this.hasDragged = false;
             return;
        }

        const timeElapsed = Date.now() - this.mouseDownTime;

        // Process as click only if NOT dragged and within time threshold
        // AND if the click didn't start on a gizmo axis (checked in onPointerDown)
        // AND if the click wasn't part of a gizmo drag operation ending now
        if (!this.hasDragged && timeElapsed < this.clickThreshold && !this.transformManager.transformControls.axis && !wasDraggingGizmo) {
             this.updateMouseCoordinates(event);
             this.performRaycastSelection(event.shiftKey, event.ctrlKey || event.metaKey); // Pass modifier keys if needed
        }

        this.isMouseDown = false;
        this.hasDragged = false;

        // Let TransformManager's own mouseUp listener re-enable OrbitControls if necessary
    }

    // Pass modifier keys if you want Shift/Ctrl multi-select without the explicit button
    // For now, we rely on the toolbar button state managed in ObjectManager
    performRaycastSelection() {
        this.raycaster.setFromCamera(this.mouse, this.camera);

        // Get *all* potential objects marked as selectable
        const objectsToCheck = [];
        this.objectManager.scene.traverse(child => {
            if (child.userData?.isSelectable && child.visible) { // Check visibility too
                // Raycaster intersects Meshes, Lines, Points - ensure it's one of these
                if (child.isMesh || child.isLine || child.isPoints) {
                     objectsToCheck.push(child);
                } else if (child.isGroup) {
                    // Maybe add logic to select groups via bounding box later?
                    // For now, only intersect direct geometry.
                }
            }
        });

        const intersects = this.raycaster.intersectObjects(objectsToCheck, false); // Intersect only the collected objects

        if (intersects.length > 0) {
            // Find the closest intersected object whose top-level selectable ancestor is selectable
            let selectedObject = null;
            for (const intersect of intersects) {
                let obj = intersect.object;
                 // Traverse up to find the object actually managed by ObjectManager (the one with isSelectable=true)
                 while (obj && !obj.userData?.isSelectable) {
                     obj = obj.parent;
                 }
                 if (obj && obj.userData?.isSelectable) {
                    selectedObject = obj;
                    break; // Take the first valid one (closest)
                 }
            }

            if (selectedObject) {
                 // console.log("B\"H InputManager: Clicked object:", selectedObject.name);
                 this.eventEmitter.emit('objectClicked', selectedObject); // Let ObjectManager handle selection logic
            } else {
                 // Intersected something, but nothing selectable (e.g., helper, non-selectable child)
                 // Treat as canvas click for selection purposes
                 // console.log("B\"H InputManager: Clicked non-selectable object");
                 this.eventEmitter.emit('canvasClicked');
            }

        } else {
            // Clicked on empty space
            // console.log("B\"H InputManager: Clicked canvas");
            this.eventEmitter.emit('canvasClicked');
        }
    }

    // --- Keyboard Handling (Example - Keep if needed) ---
    /* ... */
}

    // --- Keyboard Handling (Example) ---
    /*
    onKeyDown(event) {
        switch (event.key.toUpperCase()) {
            case 'G': this.eventEmitter.emit('setTransformMode', 'translate'); break;
            case 'R': this.eventEmitter.emit('setTransformMode', 'rotate'); break;
            case 'S': this.eventEmitter.emit('setTransformMode', 'scale'); break;
            case 'W': this.eventEmitter.emit('setTransformSpace', 'world'); break;
            case 'L': this.eventEmitter.emit('setTransformSpace', 'local'); break;
            case 'DELETE':
            case 'BACKSPACE':
                this.eventEmitter.emit('deleteSelectedRequest');
                break;
             case 'SHIFT':
                 // Could use this for sticky multi-select toggle if desired
                 // this.eventEmitter.emit('toggleMultipleSelection', true); // Or just track internally
                 break;
             case 'CONTROL':
             case 'META': // Cmd on Mac
                // Hold for temporary multi-select add/remove? More complex logic.
                 break;
             case 'F': // Focus
                 this.eventEmitter.emit('focusSelectedRequest');
                 break;
            case 'Z':
                if (event.ctrlKey || event.metaKey) {
                     if (event.shiftKey) {
                         this.eventEmitter.emit('redoRequest');
                     } else {
                         this.eventEmitter.emit('undoRequest');
                     }
                }
                break;
             case 'Y':
                 if (event.ctrlKey || event.metaKey) {
                     this.eventEmitter.emit('redoRequest');
                 }
                 break;


        }
    }

     onKeyUp(event) {
         switch (event.key.toUpperCase()) {
             case 'SHIFT':
                 // If using sticky multi-select, maybe toggle off here?
                 // this.eventEmitter.emit('toggleMultipleSelection', false);
                 break;
         }
     }
     */
