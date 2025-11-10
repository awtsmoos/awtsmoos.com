// B"H
import * as THREE from 'three';
import { MoveVerticesCommand } from '../History/Commands/MoveVerticesCommand.js';

const SELECT_COLOR = 0xffa500; // Orange
const VERTEX_COLOR = 0xffffff; // White

export class EditModeManager {
    // ** FIX: Accept orbitControls in the constructor **
    constructor(scene, eventEmitter, historyManager, objectManager, transformControls, orbitControls) {
        this.scene = scene;
        this.eventEmitter = eventEmitter;
        this.historyManager = historyManager;
        this.objectManager = objectManager;
        this.transformControls = transformControls;
        this.orbitControls = orbitControls; // ** NEW: Store a reference to the camera controls

        this.isActive = false;
        this.targetObject = null;
        this.vertexHelpers = null;
        
        this.selectedIndices = new Set();
        this.raycaster = new THREE.Raycaster();
        this.raycaster.params.Points.threshold = 0.1; // Threshold for picking vertices

        this.transformStartPositions = [];
    }

    enter(object) {
        if (!object || !object.isMesh || this.isActive) return;

        this.isActive = true;
        this.targetObject = object;
        this.selectedIndices.clear();

        this._createVisualHelpers();
        this._setupTransformListener();

        console.log(`B"H Entering Edit Mode for: ${object.name}`);
        this.eventEmitter.emit('editModeEntered', object);
    }

    exit() {
        if (!this.isActive) return;

        this._clearVisualHelpers();
        this._clearTransformListener();
        
        this.isActive = false;
        this.targetObject = null;
        this.selectedIndices.clear();

        console.log("B\"H Exiting Edit Mode");
        this.eventEmitter.emit('editModeExited');
    }

    _createVisualHelpers() {
        const geometry = this.targetObject.geometry;
        const material = new THREE.PointsMaterial({
            size: 8,
            color: VERTEX_COLOR,
            sizeAttenuation: false,
            depthTest: false,
            transparent: true
        });

        this.vertexHelpers = new THREE.Points(geometry, material);
        this.vertexHelpers.userData.isHelper = true;
        this.vertexHelpers.userData.isSelectable = false; // Make sure it's not selectable by the ObjectManager
        
        // Match the helpers to the target object's world transform
        this.vertexHelpers.matrixAutoUpdate = false; // We will manage the matrix manually
        this.vertexHelpers.matrix.copy(this.targetObject.matrixWorld);
        
        this.scene.add(this.vertexHelpers);
    }

    _clearVisualHelpers() {
        if (this.vertexHelpers) {
            this.scene.remove(this.vertexHelpers);
            this.vertexHelpers.material.dispose();
            this.vertexHelpers = null;
        }
    }

    handlePointerDown(mouse, camera) {
        if (!this.isActive || !this.vertexHelpers) return;

        this.raycaster.setFromCamera(mouse, camera);

        // ** FIX: Raycast against the vertex helpers, not the whole mesh. This is far more accurate. **
        const intersects = this.raycaster.intersectObject(this.vertexHelpers, false);

        if (intersects.length > 0) {
            // The intersection gives us the exact index of the vertex we clicked on!
            const closestVertexIndex = intersects[0].index;
            this.selectVertex(closestVertexIndex);
        }
    }
    
    selectVertex(index) {
        this.selectedIndices.clear(); // Single selection for now
        this.selectedIndices.add(index);
        this._updateSelectionVisuals();
        this._attachTransformToSelection();
    }
    
    _updateSelectionVisuals() {
        if (!this.vertexHelpers) return;
        const geometry = this.vertexHelpers.geometry;
        const positions = geometry.getAttribute('position');
        const count = positions.count;
        
        if (!geometry.getAttribute('color')) {
            geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
        }
        
        const colors = geometry.getAttribute('color');
        const baseColor = new THREE.Color(VERTEX_COLOR);
        const selectedColor = new THREE.Color(SELECT_COLOR);

        for (let i = 0; i < count; i++) {
            const color = this.selectedIndices.has(i) ? selectedColor : baseColor;
            colors.setXYZ(i, color.r, color.g, color.b);
        }
        colors.needsUpdate = true;
        this.vertexHelpers.material.vertexColors = true;
        this.vertexHelpers.material.needsUpdate = true;
    }
    
    _attachTransformToSelection() {
        if (this.selectedIndices.size !== 1) {
            this.transformControls.detach();
            return;
        }
        
        // ** FIX: Ensure the gizmo is attached to its proxy object **
        if (!this.transformControls.object || this.transformControls.object.name !== "GizmoHandle_EditMode") {
             const gizmoHandle = this.scene.getObjectByName("GizmoHandle_EditMode");
             if(gizmoHandle) this.transformControls.attach(gizmoHandle);
        }

        const index = this.selectedIndices.values().next().value;
        const positionAttribute = this.targetObject.geometry.getAttribute('position');
        const vertexPosition = new THREE.Vector3().fromBufferAttribute(positionAttribute, index);
        
        const worldPosition = vertexPosition.clone().applyMatrix4(this.targetObject.matrixWorld);

        const gizmoHandle = this.transformControls.object;
        if (!gizmoHandle) return;
        
        gizmoHandle.position.copy(worldPosition);
        gizmoHandle.rotation.set(0,0,0);
        gizmoHandle.scale.set(1,1,1);
        gizmoHandle.updateMatrixWorld(true);
    }

    _setupTransformListener() {
        // ** FIX: Use a small, invisible MESH as the handle. A plain Object3D can't be grabbed by the gizmo's raycaster. **
        const gizmoHandle = new THREE.Mesh(
            new THREE.BoxGeometry(0.1, 0.1, 0.1),
            new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthTest: false, depthWrite: false })
        );
        gizmoHandle.name = "GizmoHandle_EditMode";
        this.scene.add(gizmoHandle);
        this.transformControls.attach(gizmoHandle);

        this.onDraggingChanged = (event) => {
            // ** FIX: Disable camera controls ONLY while dragging the gizmo **
            this.orbitControls.enabled = !event.value;

            if (event.value) { // Drag started
                this.transformStartPositions = [];
                const positionAttribute = this.targetObject.geometry.getAttribute('position');
                this.selectedIndices.forEach(index => {
                    this.transformStartPositions.push(new THREE.Vector3().fromBufferAttribute(positionAttribute, index));
                });
            } else { // Drag ended
                if (this.transformStartPositions.length > 0) {
                    const newPositions = [];
                    const positionAttribute = this.targetObject.geometry.getAttribute('position');
                    this.selectedIndices.forEach(index => {
                        newPositions.push(new THREE.Vector3().fromBufferAttribute(positionAttribute, index));
                    });
                    const command = new MoveVerticesCommand(this.objectManager, this.targetObject.uuid, Array.from(this.selectedIndices), this.transformStartPositions, newPositions);
                    this.historyManager.add(command);
                    this.transformStartPositions = [];
                }
            }
        };

        this.onObjectChange = () => {
            if (this.selectedIndices.size === 0 || !this.transformControls.object) return;
            
            const newWorldPosition = this.transformControls.object.position;
            const newLocalPosition = newWorldPosition.clone().applyMatrix4(this.targetObject.matrixWorld.clone().invert());
            
            const positionAttribute = this.targetObject.geometry.getAttribute('position');
            // This logic will be expanded for multi-vertex selections later
            this.selectedIndices.forEach(index => {
                positionAttribute.setXYZ(index, newLocalPosition.x, newLocalPosition.y, newLocalPosition.z);
            });
            positionAttribute.needsUpdate = true;
            this.targetObject.geometry.computeVertexNormals();
            this.targetObject.geometry.computeBoundingSphere(); // Also good practice
        };

        this.transformControls.addEventListener('dragging-changed', this.onDraggingChanged);
        this.transformControls.addEventListener('objectChange', this.onObjectChange);
    }

    _clearTransformListener() {
        this.transformControls.removeEventListener('dragging-changed', this.onDraggingChanged);
        this.transformControls.removeEventListener('objectChange', this.onObjectChange);
        
        const gizmoHandle = this.scene.getObjectByName("GizmoHandle_EditMode");
        if (gizmoHandle) {
            this.scene.remove(gizmoHandle);
        }
        this.transformControls.detach();
        // ** FIX: ALWAYS re-enable orbit controls on exit **
        this.orbitControls.enabled = true;
    }
}