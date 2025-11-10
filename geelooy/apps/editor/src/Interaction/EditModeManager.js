// B"H
import * as THREE from 'three';
import { MoveVerticesCommand } from '../History/Commands/MoveVerticesCommand.js';

export class EditModeManager {
    
    constructor(scene, eventEmitter, historyManager, objectManager, transformManager) {
        this.scene = scene;
        this.eventEmitter = eventEmitter;
        this.historyManager = historyManager;
        this.objectManager = objectManager;
        this.transformManager = transformManager;

        this.isActive = false;
        this.targetObject = null;
        this.mouse = new THREE.Vector2();
        
        // Helpers
        this.vertexHelpers = null;
        this.edgeHelper = null; 
        this.faceHighlightHelper = null;
        this.edgeHighlightHelper = null;
        this.edgeRaycastHelper = null;

        // State
        this.selectionMode = 'VERTEX'; // VERTEX, EDGE, or FACE
        this.selectedIndices = new Set(); // Stores vertex, edge, or QUAD indices
        this.edgeMap = new Map();
        // B"H: NEW - The Quad Map to group triangles
        this.quadMap = new Map(); // Maps quad index -> [triangleIndex1, triangleIndex2]
        this.triangleToQuadMap = new Map(); // Maps triangle index -> quad index

        this.raycaster = new THREE.Raycaster();
        this.raycaster.params.Points.threshold = 0.15;
        this.raycaster.params.Line.threshold = 0.2;

        this.isDraggingVertices = false;
        this.gizmoStartPosition = new THREE.Vector3();
        this.initialVertexPositions = new Map();
        this.onDragStateChange = this._onDragStateChange.bind(this);
        this.eventEmitter.on('setEditSelectionMode', this.setSelectionMode.bind(this));
    }

    setSelectionMode(mode) {
        if (!this.isActive || this.selectionMode === mode) return;
        this.selectionMode = mode;
        this.selectedIndices.clear();
        this._updateSelectionVisuals();
        this.updateGizmoPosition();
        this.eventEmitter.emit('editSelectionModeChanged', this.selectionMode);
    }

    enter(object) {
        if (!object || !object.isMesh || this.isActive) return;

        this.isActive = true;
        this.targetObject = object;
        this.selectedIndices.clear();
        this.setSelectionMode('VERTEX');

        this.transformManager.setInteractionMode('VERTEX', { onVertexChange: this.onSubObjectMoved.bind(this) });
        this.transformManager.transformControls.addEventListener('dragging-changed', this.onDragStateChange);

        this._buildEdgeMap();
        // B"H: Build the quad map
        this._buildQuadMap();
        this._createHelpers();
        this.eventEmitter.emit('editModeEntered', object);
    }

    exit() {
        if (!this.isActive) return;

        this.transformManager.transformControls.removeEventListener('dragging-changed', this.onDragStateChange);
        this.transformManager.setInteractionMode('OBJECT');
        this.transformManager.detach();

        this._clearHelpers();
        
        this.isActive = false;
        this.targetObject = null;
        this.selectedIndices.clear();
        this.edgeMap.clear();
        this.quadMap.clear();
        this.triangleToQuadMap.clear();
        
        this.eventEmitter.emit('editModeExited');
    }

    // NEW - Analyzes geometry to group triangles into quads
    _buildQuadMap() {
	    this.quadMap.clear();
	    this.triangleToQuadMap.clear();
	    const geometry = this.targetObject.geometry;
	    const index = geometry.index;
	    if (!index) return;
	
	    const processedTriangles = new Set();
	    let quadIndex = 0;
	
	    // --- Pass 1: Find all perfect quad pairs ---
	    for (let i = 0; i < index.count / 3; i++) {
	        if (processedTriangles.has(i)) continue;
	
	        const tri1_indices = [index.getX(i * 3), index.getX(i * 3 + 1), index.getX(i * 3 + 2)];
	        let foundPartner = false;
	
	        // Find a partner triangle by checking for a shared edge
	        for (let j = i + 1; j < index.count / 3; j++) {
	            if (processedTriangles.has(j)) continue;
	
	            const tri2_indices = [index.getX(j * 3), index.getX(j * 3 + 1), index.getX(j * 3 + 2)];
	            
	            // Count shared vertices between the two triangles
	            const sharedVertices = tri1_indices.filter(v => tri2_indices.includes(v));
	
	            if (sharedVertices.length === 2) { // They share exactly one edge
	                this.quadMap.set(quadIndex, [i, j]);
	                this.triangleToQuadMap.set(i, quadIndex);
	                this.triangleToQuadMap.set(j, quadIndex);
	                processedTriangles.add(i);
	                processedTriangles.add(j);
	                quadIndex++;
	                foundPartner = true;
	                break; 
	            }
	        }
	    }
	
	    // --- Pass 2: Any triangle not in a pair is its own "face" ---
	    for (let i = 0; i < index.count / 3; i++) {
	        if (!processedTriangles.has(i)) {
	            this.quadMap.set(quadIndex, [i]); // A "quad" of one triangle
	            this.triangleToQuadMap.set(i, quadIndex);
	            // No need to add to processedTriangles as we won't loop again
	            quadIndex++;
	        }
	    }
	}


    _buildEdgeMap() {
        this.edgeMap.clear();
        const geometry = this.targetObject.geometry;
        const index = geometry.index;
        let edgeIndex = 0;

        if (index) {
            for (let i = 0; i < index.count; i += 3) {
                const a = index.getX(i);
                const b = index.getX(i + 1);
                const c = index.getX(i + 2);
                const edges = [[a, b], [b, c], [c, a]];
                for (const [v1, v2] of edges) {
                    const key = v1 < v2 ? `${v1}-${v2}` : `${v2}-${v1}`;
                    if (!this.edgeMap.has(key)) {
                        this.edgeMap.set(key, { index: edgeIndex++, vertices: [v1, v2] });
                    }
                }
            }
        }
    }

    _createHelpers() {
        const geometry = this.targetObject.geometry;
        
        this.vertexHelpers = new THREE.Points(geometry, new THREE.PointsMaterial({ size: 8, sizeAttenuation: false, vertexColors: true, depthTest: false, transparent: true }));
        
        this.edgeHelper = new THREE.LineSegments(
            new THREE.EdgesGeometry(geometry, 1),
            new THREE.LineBasicMaterial({ color: 0x000000 })
        );

        this.faceHighlightHelper = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshBasicMaterial({ color: 0xffa500, side: THREE.DoubleSide, transparent: true, opacity: 0.4, depthTest: false }));
        
        this.edgeHighlightHelper = new THREE.LineSegments(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0xffa500, linewidth: 4, depthTest: false, transparent: true }));

        const edgeVertices = [];
        this.edgeMap.forEach(edge => {
            const v1 = new THREE.Vector3().fromBufferAttribute(geometry.getAttribute('position'), edge.vertices[0]);
            const v2 = new THREE.Vector3().fromBufferAttribute(geometry.getAttribute('position'), edge.vertices[1]);
            edgeVertices.push(v1, v2);
        });
        const raycastGeom = new THREE.BufferGeometry().setFromPoints(edgeVertices);
        this.edgeRaycastHelper = new THREE.LineSegments(raycastGeom, new THREE.MeshBasicMaterial({ visible: false }));
        this.edgeRaycastHelper.userData.edgeMap = Array.from(this.edgeMap.values()).map(e => e.index);


        [this.vertexHelpers, this.edgeHelper, this.faceHighlightHelper, this.edgeHighlightHelper, this.edgeRaycastHelper].forEach(helper => {
            helper.matrixAutoUpdate = false;
            helper.matrix.copy(this.targetObject.matrixWorld);
            this.scene.add(helper);
        });

        const gizmoHandle = new THREE.Mesh(new THREE.SphereGeometry(0.01), new THREE.MeshBasicMaterial({ visible: false }));
        gizmoHandle.name = "GizmoHandle_EditMode";
        this.scene.add(gizmoHandle);
    }

    _clearHelpers() {
        [this.vertexHelpers, this.edgeHelper, this.faceHighlightHelper, this.edgeHighlightHelper, this.edgeRaycastHelper].forEach(helper => {
            if (helper) {
                this.scene.remove(helper);
                if (helper.geometry) helper.geometry.dispose();
                if (helper.material) helper.material.dispose();
            }
        });
        const gizmoHandle = this.scene.getObjectByName("GizmoHandle_EditMode");
        if (gizmoHandle) this.scene.remove(gizmoHandle);
    }

    handlePointerDown(event) {
    if (!this.isActive) return;
    
    const rect = event.target.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.mouse, this.transformManager.camera);
    let intersects;

    let indexToSelect = -1;
    
    if (this.selectionMode === 'VERTEX') {
        intersects = this.raycaster.intersectObject(this.vertexHelpers);
        if (intersects.length > 0) indexToSelect = intersects[0].index;

    } else if (this.selectionMode === 'FACE') {
        this.targetObject.material.side = THREE.FrontSide;
        intersects = this.raycaster.intersectObject(this.targetObject);
        this.targetObject.material.side = THREE.DoubleSide;
        if (intersects.length > 0 && intersects[0].face) {
             // B"H FIX: The .face.a/b/c are vertex indices. .faceIndex is the triangle index.
             const triangleIndex = intersects[0].faceIndex;
             if(this.triangleToQuadMap.has(triangleIndex)) {
                 indexToSelect = this.triangleToQuadMap.get(triangleIndex);
             }
        }
    
    } else if (this.selectionMode === 'EDGE') {
        intersects = this.raycaster.intersectObject(this.edgeRaycastHelper);
        if (intersects.length > 0) {
            const lineIndex = intersects[0].index;
            indexToSelect = this.edgeRaycastHelper.userData.edgeMap[lineIndex];
        }
    }
    
    if (indexToSelect !== -1) {
        this._toggleSelection(indexToSelect, event.shiftKey);
    } else if (!event.shiftKey) {
        this.selectedIndices.clear();
    }

    this._updateSelectionVisuals();
    this.updateGizmoPosition();
}

    _toggleSelection(index, isMultiSelect) {
        if (isMultiSelect) {
            this.selectedIndices.has(index) ? this.selectedIndices.delete(index) : this.selectedIndices.add(index);
        } else {
            this.selectedIndices.clear();
            this.selectedIndices.add(index);
        }
    }

    toggleSelectAll() {
        if (!this.targetObject) return;
        const geometry = this.targetObject.geometry;
        let count;
        if (this.selectionMode === 'VERTEX') count = geometry.getAttribute('position').count;
        else if (this.selectionMode === 'FACE') count = this.quadMap.size;
        else if (this.selectionMode === 'EDGE') count = this.edgeMap.size;
        else return;

        if (this.selectedIndices.size === count) this.selectedIndices.clear();
        else for (let i = 0; i < count; i++) this.selectedIndices.add(i);
        
        this._updateSelectionVisuals();
        this.updateGizmoPosition();
    }
    
    _updateSelectionVisuals() {
        this.vertexHelpers.material.opacity = this.selectionMode === 'VERTEX' ? 1 : 0.2;
        this.faceHighlightHelper.visible = false;
        this.edgeHighlightHelper.visible = false;
        
        const posAttr = this.targetObject.geometry.getAttribute('position');
        const colors = new Float32Array(posAttr.count * 3).fill(1);
        const orange = new THREE.Color(1, 0.65, 0);

        if (this.selectionMode === 'VERTEX') {
            this.selectedIndices.forEach(index => orange.toArray(colors, index * 3));
        }
        this.vertexHelpers.geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        if (this.selectionMode === 'FACE' && this.selectedIndices.size > 0) {
            // B"H FIX: Rebuild highlight geometry from selected QUADS
            this.faceHighlightHelper.visible = true;
            const originalIndex = this.targetObject.geometry.index;
            const originalPosition = this.targetObject.geometry.getAttribute('position');
            const newIndices = [];
            const newVertices = [];
            const vertexMap = new Map();

            this.selectedIndices.forEach(quadIndex => {
                const triangleIndices = this.quadMap.get(quadIndex);
                triangleIndices.forEach(triangleIndex => {
                     const base = triangleIndex * 3;
                     for (let i = 0; i < 3; i++) {
                         const index = originalIndex.getX(base + i);
                         if (!vertexMap.has(index)) {
                             vertexMap.set(index, newVertices.length / 3);
                             newVertices.push(originalPosition.getX(index), originalPosition.getY(index), originalPosition.getZ(index));
                         }
                         newIndices.push(vertexMap.get(index));
                     }
                });
            });
            this.faceHighlightHelper.geometry.dispose();
            this.faceHighlightHelper.geometry = new THREE.BufferGeometry();
            this.faceHighlightHelper.geometry.setAttribute('position', new THREE.Float32BufferAttribute(newVertices, 3));
            this.faceHighlightHelper.geometry.setIndex(newIndices);
        }
        
        if (this.selectionMode === 'EDGE' && this.selectedIndices.size > 0) {
            this.edgeHighlightHelper.visible = true;
            const vertices = [];
            Array.from(this.edgeMap.values()).forEach(edge => {
                if (this.selectedIndices.has(edge.index)) {
                    vertices.push(new THREE.Vector3().fromBufferAttribute(posAttr, edge.vertices[0]));
                    vertices.push(new THREE.Vector3().fromBufferAttribute(posAttr, edge.vertices[1]));
                }
            });
            this.edgeHighlightHelper.geometry.setFromPoints(vertices);
        }
    }
    
    updateGizmoPosition() {
        const gizmoHandle = this.scene.getObjectByName("GizmoHandle_EditMode");
        if (this.selectedIndices.size === 0 || !gizmoHandle) {
            this.transformManager.attachToProxy(null);
            return;
        }

        const center = new THREE.Vector3();
        const posAttr = this.targetObject.geometry.getAttribute('position');
        const verticesToAverage = new Set();
        
        if (this.selectionMode === 'VERTEX') {
            this.selectedIndices.forEach(index => verticesToAverage.add(index));
        } else if (this.selectionMode === 'FACE') {
            const indexAttr = this.targetObject.geometry.index;
            this.selectedIndices.forEach(quadIndex => {
                const triangleIndices = this.quadMap.get(quadIndex);
                triangleIndices.forEach(triangleIndex => {
                    verticesToAverage.add(indexAttr.getX(triangleIndex * 3));
                    verticesToAverage.add(indexAttr.getX(triangleIndex * 3 + 1));
                    verticesToAverage.add(indexAttr.getX(triangleIndex * 3 + 2));
                });
            });
        } else if (this.selectionMode === 'EDGE') {
            Array.from(this.edgeMap.values()).forEach(edge => {
                if (this.selectedIndices.has(edge.index)) {
                    verticesToAverage.add(edge.vertices[0]);
                    verticesToAverage.add(edge.vertices[1]);
                }
            });
        }
        
        verticesToAverage.forEach(index => {
            center.add(new THREE.Vector3().fromBufferAttribute(posAttr, index));
        });
        center.divideScalar(verticesToAverage.size);
        
        gizmoHandle.position.copy(center.applyMatrix4(this.targetObject.matrixWorld));
        gizmoHandle.updateMatrixWorld(true);
        this.transformManager.attachToProxy(gizmoHandle);
    }
    
    _onDragStateChange(event) {
        this.isDraggingVertices = event.value;
        const gizmoHandle = this.transformManager.transformControls.object;

        if (this.isDraggingVertices && gizmoHandle) {
            this.gizmoStartPosition.copy(gizmoHandle.position);
            this.initialVertexPositions.clear();
            const posAttr = this.targetObject.geometry.getAttribute('position');
            this._getAffectedVertexIndices().forEach(index => {
                this.initialVertexPositions.set(index, new THREE.Vector3().fromBufferAttribute(posAttr, index));
            });
        } else if (!this.isDraggingVertices && this.initialVertexPositions.size > 0) {
            const indices = Array.from(this.initialVertexPositions.keys());
            const oldPositions = Array.from(this.initialVertexPositions.values());
            const newPositions = indices.map(index => new THREE.Vector3().fromBufferAttribute(this.targetObject.geometry.getAttribute('position'), index));
            
            const command = new MoveVerticesCommand(this.objectManager, this.targetObject.uuid, indices, oldPositions, newPositions);
            this.historyManager.add(command);
            this.initialVertexPositions.clear();
        }
    }
    
    _getAffectedVertexIndices() {
        const affected = new Set();
        if (this.selectionMode === 'VERTEX') {
            this.selectedIndices.forEach(idx => affected.add(idx));
        } else if (this.selectionMode === 'FACE') {
            const indexAttr = this.targetObject.geometry.index;
            this.selectedIndices.forEach(quadIndex => {
                const triangleIndices = this.quadMap.get(quadIndex);
                triangleIndices.forEach(triangleIndex => {
                    affected.add(indexAttr.getX(triangleIndex * 3));
                    affected.add(indexAttr.getX(triangleIndex * 3 + 1));
                    affected.add(indexAttr.getX(triangleIndex * 3 + 2));
                });
            });
        } else if (this.selectionMode === 'EDGE') {
            Array.from(this.edgeMap.values()).forEach(edge => {
                if (this.selectedIndices.has(edge.index)) {
                    affected.add(edge.vertices[0]);
                    affected.add(edge.vertices[1]);
                }
            });
        }
        return affected;
    }

	 onSubObjectMoved() {
        const gizmoHandle = this.transformManager.transformControls.object;
        if (!gizmoHandle || !this.isDraggingVertices) return;
        
        const delta = new THREE.Vector3().subVectors(gizmoHandle.position, this.gizmoStartPosition);
        const invWorldMatrix = this.targetObject.matrixWorld.clone().invert();
        const localDelta = delta.applyMatrix4(new THREE.Matrix4().extractRotation(invWorldMatrix));
        
        const posAttr = this.targetObject.geometry.getAttribute('position');
        this.initialVertexPositions.forEach((initialPos, index) => {
            posAttr.setXYZ(index, initialPos.x + localDelta.x, initialPos.y + localDelta.y, initialPos.z + localDelta.z);
        });

        posAttr.needsUpdate = true;
        this.targetObject.geometry.computeVertexNormals();
        
        if (this.edgeHelper) {
            this.edgeHelper.geometry.dispose();
            this.edgeHelper.geometry = new THREE.EdgesGeometry(this.targetObject.geometry, 1);
        }
        this._updateSelectionVisuals();
        this.edgeRaycastHelper.geometry.dispose();
        const edgeVertices = [];
        this.edgeMap.forEach(edge => {
            const v1 = new THREE.Vector3().fromBufferAttribute(posAttr, edge.vertices[0]);
            const v2 = new THREE.Vector3().fromBufferAttribute(posAttr, edge.vertices[1]);
            edgeVertices.push(v1, v2);
        });
        this.edgeRaycastHelper.geometry = new THREE.BufferGeometry().setFromPoints(edgeVertices);
    }
}