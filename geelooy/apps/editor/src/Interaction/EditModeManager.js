// B"H
import * as THREE from 'three';
import { MoveVerticesCommand } from '../History/Commands/MoveVerticesCommand.js';

export class EditModeManager {
    
    constructor(scene, eventEmitter, historyManager, objectManager, transformManager) {
        this.scene = scene;
        this.eventEmitter = eventEmitter;
        this.historyManager = historyManager;
        this.objectManager = objectManager;
        this.transformManager = transformManager; // The single point of contact for the gizmo

        this.isActive = false;
        this.targetObject = null;
        this.vertexHelpers = null;
        this.mouse = new THREE.Vector2();
        
        this.selectedIndices = new Set();
        this.raycaster = new THREE.Raycaster();
        this.raycaster.params.Points.threshold = 0.15; // Make it a bit easier to click
    }

    enter(object) {
        if (!object || !object.isMesh || this.isActive) return;

        this.isActive = true;
        this.targetObject = object;
        this.selectedIndices.clear();

        // Tell TransformManager to switch its internal logic
        this.transformManager.setInteractionMode('VERTEX', { 
            onVertexChange: this.onVertexMoved.bind(this) 
        });

        this._createHelpers();
        this.eventEmitter.emit('editModeEntered', object);
    }

    exit() {
        if (!this.isActive) return;

        // Tell TransformManager to go back to its default behavior
        this.transformManager.setInteractionMode('OBJECT');
        this.transformManager.detach(); // Ensure gizmo is gone

        this._clearHelpers();
        
        this.isActive = false;
        this.targetObject = null;
        this.selectedIndices.clear();
        
        this.eventEmitter.emit('editModeExited');
    }

    _createHelpers() {
        // Create vertex points
        const material = new THREE.PointsMaterial({ size: 10, color: 0xffffff, sizeAttenuation: false, depthTest: false });
        this.vertexHelpers = new THREE.Points(this.targetObject.geometry, material);
        this.vertexHelpers.matrixAutoUpdate = false;
        this.vertexHelpers.matrix.copy(this.targetObject.matrixWorld);
        this.scene.add(this.vertexHelpers);
        
        // Create the invisible proxy object the gizmo will attach to
        const gizmoHandle = new THREE.Mesh(
            new THREE.SphereGeometry(0.01),
            new THREE.MeshBasicMaterial({ visible: false, depthTest: false, depthWrite: false, transparent: true })
        );
        gizmoHandle.name = "GizmoHandle_EditMode";
        this.scene.add(gizmoHandle);
    }

    _clearHelpers() {
        if (this.vertexHelpers) {
            this.scene.remove(this.vertexHelpers);
            this.vertexHelpers.material.dispose();
            this.vertexHelpers = null;
        }
        const gizmoHandle = this.scene.getObjectByName("GizmoHandle_EditMode");
        if (gizmoHandle) {
             this.scene.remove(gizmoHandle);
             gizmoHandle.geometry.dispose();
             gizmoHandle.material.dispose();
        }
    }

    handlePointerDown(event) {
        if (!this.isActive) return;
        
        const rect = event.target.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
	    this.raycaster.setFromCamera(this.mouse, this.transformManager.camera);
	
	    const intersects = this.raycaster.intersectObject(this.vertexHelpers);
	
	    if (intersects.length > 0) {
	        this.selectVertex(intersects[0].index);
	    } else {
            this.selectedIndices.clear();
            this._updateSelectionVisuals();
            this.transformManager.attachToProxy(null); // Politely ask manager to detach
        }
    }
    
    selectVertex(index) {
        this.selectedIndices.clear();
        this.selectedIndices.add(index);
        this._updateSelectionVisuals();
        this.updateGizmoPosition();
    }
    
    _updateSelectionVisuals() { /* This method remains the same */ }
    
    updateGizmoPosition() {
	    const gizmoHandle = this.scene.getObjectByName("GizmoHandle_EditMode");
	    if (this.selectedIndices.size !== 1 || !gizmoHandle) {
	        this.transformManager.attachToProxy(null);
	        return;
	    }
	    const index = this.selectedIndices.values().next().value;
	    const posAttr = this.targetObject.geometry.getAttribute('position');
	    const worldPos = new THREE.Vector3().fromBufferAttribute(posAttr, index).applyMatrix4(this.targetObject.matrixWorld);
	
	    gizmoHandle.position.copy(worldPos);
	    gizmoHandle.updateMatrixWorld(true);

	    this.transformManager.attachToProxy(gizmoHandle);
	}
    
	 onVertexMoved() {
        const gizmoHandle = this.transformManager.transformControls.object;
        if (!gizmoHandle || this.selectedIndices.size === 0) return;
        
        const newWorldPos = gizmoHandle.position;
        const newLocalPos = newWorldPos.clone().applyMatrix4(this.targetObject.matrixWorld.clone().invert());
        const posAttr = this.targetObject.geometry.getAttribute('position');

        this.selectedIndices.forEach(index => {
            posAttr.setXYZ(index, newLocalPos.x, newLocalPos.y, newLocalPos.z);
        });
        posAttr.needsUpdate = true;
        this.targetObject.geometry.computeVertexNormals();
    }

    _setupVertexTransformListener() {
        // This listener is ONLY for creating the Undo/Redo command for vertex moves.
        this.onObjectChange = () => {
            const gizmoHandle = this.transformManager.transformControls.object;
            if (!gizmoHandle || this.selectedIndices.size === 0) return;
            
            const newWorldPosition = gizmoHandle.position;
            const newLocalPosition = newWorldPosition.clone().applyMatrix4(this.targetObject.matrixWorld.clone().invert());
            const positionAttribute = this.targetObject.geometry.getAttribute('position');
            this.selectedIndices.forEach(index => {
                positionAttribute.setXYZ(index, newLocalPosition.x, newLocalPosition.y, newLocalPosition.z);
            });
            positionAttribute.needsUpdate = true;
            this.targetObject.geometry.computeVertexNormals();
        };
        this.transformManager.transformControls.addEventListener('objectChange', this.onObjectChange);
    }

    _clearVertexTransformListener() {
        this.transformManager.transformControls.removeEventListener('objectChange', this.onObjectChange);
    }
}