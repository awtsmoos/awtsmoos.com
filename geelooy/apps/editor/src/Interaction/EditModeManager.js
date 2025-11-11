// B"H
import * as THREE from 'three';
import {
	MoveVerticesCommand
} from '../History/Commands/MoveVerticesCommand.js';

import {
	SubdivideFacesCommand
} from '../History/Commands/SubdivideFacesCommand.js';

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

		this.vertexHelpers = null;
		this.edgeHelper = null;
		this.faceHighlightHelper = null;
		this.edgeHighlightHelper = null;

		this.selectionMode = 'VERTEX';
		this.selectedIndices = new Set();
		this.edgeMap = new Map();
		this.quadMap = new Map();
		this.triangleToQuadMap = new Map();

		this.raycaster = new THREE.Raycaster();
		this.raycaster.params.Points.threshold = 0.15;

		this.isDraggingVertices = false;
		this.gizmoStartPosition = new THREE.Vector3();
		this.initialVertexPositions = new Map();
		this.onDragStateChange = this._onDragStateChange.bind(this);
		this.eventEmitter.on('setEditSelectionMode', this.setSelectionMode.bind(this));
		// B"H: Listen for subdivide request from the toolbar
		this.eventEmitter.on('subdivideRequest', this.subdivideSelectedFaces.bind(this));
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
		this.transformManager.setInteractionMode('VERTEX', {
			onVertexChange: this.onSubObjectMoved.bind(this)
		});
		this.transformManager.transformControls.addEventListener('dragging-changed', this.onDragStateChange);
		this._buildEdgeMap();
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

	// B"H: New method to trigger subdivision
	subdivideSelectedFaces() {
		if (!this.isActive || this.selectionMode !== 'FACE' || this.selectedIndices.size === 0) return;
		const command = new SubdivideFacesCommand(this.objectManager, this.targetObject.uuid, this.selectedIndices, this);
		this.historyManager.add(command);
	}

	_buildQuadMap() {
		this.quadMap.clear();
		this.triangleToQuadMap.clear();
		const geometry = this.targetObject.geometry;
		const index = geometry.index;
		if (!index) return;
		const processedTriangles = new Set();
		let quadIndex = 0;
		for (let i = 0; i < index.count / 3; i++) {
			if (processedTriangles.has(i)) continue;
			const tri1_indices = [index.getX(i * 3), index.getX(i * 3 + 1), index.getX(i * 3 + 2)];
			let foundPartner = false;
			for (let j = i + 1; j < index.count / 3; j++) {
				if (processedTriangles.has(j)) continue;
				const tri2_indices = [index.getX(j * 3), index.getX(j * 3 + 1), index.getX(j * 3 + 2)];
				const sharedVertices = tri1_indices.filter(v => tri2_indices.includes(v));
				if (sharedVertices.length === 2) {
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
		for (let i = 0; i < index.count / 3; i++) {
			if (!processedTriangles.has(i)) {
				this.quadMap.set(quadIndex, [i]);
				this.triangleToQuadMap.set(i, quadIndex);
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
				const edges = [
					[a, b],
					[b, c],
					[c, a]
				];
				for (const [v1, v2] of edges) {
					const key = v1 < v2 ? `${v1}-${v2}` : `${v2}-${v1}`;
					if (!this.edgeMap.has(key)) {
						this.edgeMap.set(key, {
							index: edgeIndex++,
							vertices: [v1, v2]
						});
					}
				}
			}
		}
	}

	_createHelpers() {
		const geometry = this.targetObject.geometry;
		this.vertexHelpers = new THREE.Points(geometry, new THREE.PointsMaterial({
			size: 8,
			sizeAttenuation: false,
			vertexColors: true,
			depthTest: false,
			transparent: true
		}));
		this.edgeHelper = new THREE.LineSegments(new THREE.EdgesGeometry(geometry, 1), new THREE.LineBasicMaterial({
			color: 0x000000
		}));
		this.faceHighlightHelper = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshBasicMaterial({
			color: 0xffa500,
			side: THREE.DoubleSide,
			transparent: true,
			opacity: 0.4,
			depthTest: false
		}));
		this.edgeHighlightHelper = new THREE.LineSegments(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({
			color: 0xffa500,
			linewidth: 4,
			depthTest: false,
			transparent: true
		}));
		[this.vertexHelpers, this.edgeHelper, this.faceHighlightHelper, this.edgeHighlightHelper].forEach(h => {
			h.matrixAutoUpdate = false;
			h.matrix.copy(this.targetObject.matrixWorld);
			this.scene.add(h);
		});
		const gizmoHandle = new THREE.Mesh(new THREE.SphereGeometry(0.01), new THREE.MeshBasicMaterial({
			visible: false
		}));
		gizmoHandle.name = "GizmoHandle_EditMode";
		this.scene.add(gizmoHandle);
	}

	_clearHelpers() {
		[this.vertexHelpers, this.edgeHelper, this.faceHighlightHelper, this.edgeHighlightHelper].forEach(h => {
			if (h) {
				this.scene.remove(h);
				if (h.geometry) h.geometry.dispose();
				if (h.material) h.material.dispose();
			}
		});
		const gizmoHandle = this.scene.getObjectByName("GizmoHandle_EditMode");
		if (gizmoHandle) this.scene.remove(gizmoHandle);
	}

	// B"H: Helper methods for implied selection
	_getVerticesOfQuad(quadIndex) {
		const vertices = new Set();
		const tris = this.quadMap.get(quadIndex);
		const indexAttr = this.targetObject.geometry.index;
		if (!tris || !indexAttr) return vertices;
		tris.forEach(triIndex => {
			vertices.add(indexAttr.getX(triIndex * 3));
			vertices.add(indexAttr.getX(triIndex * 3 + 1));
			vertices.add(indexAttr.getX(triIndex * 3 + 2));
		});
		return vertices;
	}

	_getEdgesOfQuad(quadIndex) {
		const edges = new Set();
		const quadVertices = this._getVerticesOfQuad(quadIndex);
		this.edgeMap.forEach(edge => {
			if (quadVertices.has(edge.vertices[0]) && quadVertices.has(edge.vertices[1])) {
				edges.add(edge);
			}
		});
		return edges;
	}

	_updateSelectionVisuals() {
		this.vertexHelpers.material.opacity = this.selectionMode === 'VERTEX' ? 1 : 0.2;
		this.faceHighlightHelper.visible = false;
		this.edgeHighlightHelper.visible = false;

		const posAttr = this.targetObject.geometry.getAttribute('position');
		const colors = new Float32Array(posAttr.count * 3)
			.fill(1);
		const orange = new THREE.Color(1, 0.65, 0);
		if (this.selectionMode === 'VERTEX') {
			this.selectedIndices.forEach(index => orange.toArray(colors, index * 3));
		}
		this.vertexHelpers.geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

		// B"H: Logic for implied face highlighting
		const facesToHighlight = new Set();
		if (this.selectionMode === 'FACE') {
			this.selectedIndices.forEach(idx => facesToHighlight.add(idx));
		} else if (this.selectionMode === 'VERTEX') {
			this.quadMap.forEach((tris, quadIdx) => {
				const quadVerts = this._getVerticesOfQuad(quadIdx);
				if (quadVerts.size > 0 && Array.from(quadVerts)
					.every(v => this.selectedIndices.has(v))) {
					facesToHighlight.add(quadIdx);
				}
			});
		} else if (this.selectionMode === 'EDGE') {
			this.quadMap.forEach((tris, quadIdx) => {
				const quadEdges = this._getEdgesOfQuad(quadIdx);
				if (quadEdges.size > 0 && Array.from(quadEdges)
					.every(e => this.selectedIndices.has(e.index))) {
					facesToHighlight.add(quadIdx);
				}
			});
		}

		if (facesToHighlight.size > 0) {
			this.faceHighlightHelper.visible = true;
			const originalIndex = this.targetObject.geometry.index;
			const originalPosition = this.targetObject.geometry.getAttribute('position');
			const newIndices = [];
			const newVertices = [];
			const vertexMap = new Map();
			facesToHighlight.forEach(quadIndex => {
				const triangleIndices = this.quadMap.get(quadIndex);
				if (!triangleIndices) return;
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
			this.edgeMap.forEach(edge => {
				if (this.selectedIndices.has(edge.index)) {
					vertices.push(new THREE.Vector3()
						.fromBufferAttribute(posAttr, edge.vertices[0]));
					vertices.push(new THREE.Vector3()
						.fromBufferAttribute(posAttr, edge.vertices[1]));
				}
			});
			this.edgeHighlightHelper.geometry.setFromPoints(vertices);
		}
	}


	
	handlePointerDown(event) {
    // B"H: Only allow the left mouse button (button index 0) to trigger selection.
    if (event.button !== 0) return;
    if (!this.isActive) return;
    
    const rect = event.target.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    let indexToSelect = -1;
    
    if (this.selectionMode === 'VERTEX') {
        indexToSelect = this._findClosestVertexToMouse();
    } else if (this.selectionMode === 'FACE') {
        this.raycaster.setFromCamera(this.mouse, this.transformManager.camera);
        // Temporarily set side to front for raycasting to avoid hitting backfaces first
        const originalSide = this.targetObject.material.side;
        this.targetObject.material.side = THREE.FrontSide;
        const intersects = this.raycaster.intersectObject(this.targetObject);
        // Restore the original side setting
        this.targetObject.material.side = originalSide; 
        
        if (intersects.length > 0 && intersects[0].face) {
             const triangleIndex = intersects[0].faceIndex;
             if(this.triangleToQuadMap.has(triangleIndex)) {
                 indexToSelect = this.triangleToQuadMap.get(triangleIndex);
             }
        }
    } else if (this.selectionMode === 'EDGE') {
        indexToSelect = this._findClosestEdgeToMouse();
    }
    
    if (indexToSelect !== -1) {
        this._toggleSelection(indexToSelect, event.shiftKey);
    } else if (!event.shiftKey) {
        this.selectedIndices.clear();
    }

    this._updateSelectionVisuals();
    this.updateGizmoPosition();
    
    //  Notify the UI that the component selection has changed
    // This allows the toolbar to update the state of the Subdivide button.
    this.eventEmitter.emit('selectionChanged', this.objectManager.getSelectedObjectUUIDs());
}
	_findClosestEdgeToMouse() {
		const e = this.transformManager.camera,
			t = this.transformManager.domElement.getBoundingClientRect(),
			i = new THREE.Vector2(this.mouse.x * t.width / 2, this.mouse.y * t.height / 2);
		let s = -1,
			n = Infinity;
		const o = this.targetObject.geometry.getAttribute("position"),
			a = this.targetObject.matrixWorld;
		return this.edgeMap.forEach(r => {
			const l = new THREE.Vector3()
				.fromBufferAttribute(o, r.vertices[0])
				.applyMatrix4(a),
				c = new THREE.Vector3()
				.fromBufferAttribute(o, r.vertices[1])
				.applyMatrix4(a);
			if (l.clone()
				.project(e)
				.z > 1 || c.clone()
				.project(e)
				.z > 1) return;
			l.project(e), c.project(e);
			const d = new THREE.Vector2(l.x * t.width / 2, l.y * t.height / 2),
				h = new THREE.Vector2(c.x * t.width / 2, c.y * t.height / 2),
				u = this._distanceSqToLineSegment(i, d, h);
			u < n && (n = u, s = r.index)
		}), n < 100 ? s : -1
	}
	_distanceSqToLineSegment(e, t, i) {
		const s = t.distanceToSquared(i);
		if (s === 0) return e.distanceToSquared(t);
		let n = ((e.x - t.x) * (i.x - t.x) + (e.y - t.y) * (i.y - t.y)) / s;
		n = Math.max(0, Math.min(1, n));
		const o = new THREE.Vector2(t.x + n * (i.x - t.x), t.y + n * (i.y - t.y));
		return e.distanceToSquared(o)
	}
	_toggleSelection(e, t) {
		t ? this.selectedIndices.has(e) ? this.selectedIndices.delete(e) : this.selectedIndices.add(e) : (this.selectedIndices.clear(), this.selectedIndices.add(e))
	}
	toggleSelectAll() {
    if (!this.targetObject) return;
    const geometry = this.targetObject.geometry;
    let maxIndex = 0;
    if (this.selectionMode === "VERTEX") {
        maxIndex = geometry.getAttribute("position").count;
    } else if (this.selectionMode === "FACE") {
        maxIndex = this.quadMap.size;
    } else if (this.selectionMode === "EDGE") {
        maxIndex = this.edgeMap.size;
    } else {
        return;
    }

    if (this.selectedIndices.size === maxIndex) {
        this.selectedIndices.clear();
    } else {
        for (let i = 0; i < maxIndex; i++) {
            this.selectedIndices.add(i);
        }
    }
    
    this._updateSelectionVisuals();
    this.updateGizmoPosition();

    // B"H FIX: Notify the UI that the component selection has changed
    this.eventEmitter.emit('selectionChanged', this.objectManager.getSelectedObjectUUIDs());
}



_getOrderedVerticesOfQuad(quadIndex) {
    const tris = this.quadMap.get(quadIndex);
    const indexAttr = this.targetObject.geometry.index;
    if (!tris || tris.length !== 2 || !indexAttr) return null;

    const tri1 = [indexAttr.getX(tris[0] * 3), indexAttr.getX(tris[0] * 3 + 1), indexAttr.getX(tris[0] * 3 + 2)];
    const tri2 = [indexAttr.getX(tris[1] * 3), indexAttr.getX(tris[1] * 3 + 1), indexAttr.getX(tris[1] * 3 + 2)];

    const tri1Set = new Set(tri1);
    const shared = tri2.filter(v => tri1Set.has(v));
    if (shared.length !== 2) return null;

    const nonShared1 = tri1.find(v => !shared.includes(v));
    const nonShared2 = tri2.find(v => !shared.includes(v));
    
    // To find the correct order, check the winding of the first triangle
    const idxInTri1 = tri1.indexOf(nonShared1);
    const nextInTri1 = tri1[(idxInTri1 + 1) % 3];
    
    // The vertex after the non-shared one in the first triangle determines the order
    if (nextInTri1 === shared[0]) {
        return [nonShared1, shared[0], nonShared2, shared[1]];
    } else {
        return [nonShared1, shared[1], nonShared2, shared[0]];
    }
}
	updateGizmoPosition() {
		const e = this.scene.getObjectByName("GizmoHandle_EditMode");
		if (this.selectedIndices.size === 0 || !e) return this.transformManager.attachToProxy(null);
		const t = new THREE.Vector3,
			i = this.targetObject.geometry.getAttribute("position"),
			s = new Set;
		if (this.selectionMode === "VERTEX") this.selectedIndices.forEach(e => s.add(e));
		else if (this.selectionMode === "FACE") {
			const e = this.targetObject.geometry.index;
			this.selectedIndices.forEach(t => {
				const i = this.quadMap.get(t);
				i.forEach(t => {
					s.add(e.getX(3 * t)), s.add(e.getX(3 * t + 1)), s.add(e.getX(3 * t + 2))
				})
			})
		} else if (this.selectionMode === "EDGE")
			for (const e of this.edgeMap.values()) this.selectedIndices.has(e.index) && (s.add(e.vertices[0]), s.add(e.vertices[1]));
		s.forEach(e => {
			t.add(new THREE.Vector3()
				.fromBufferAttribute(i, e))
		}), t.divideScalar(s.size), e.position.copy(t.applyMatrix4(this.targetObject.matrixWorld)), e.updateMatrixWorld(!0), this.transformManager.attachToProxy(e)
	}
	_onDragStateChange(e) {
		this.isDraggingVertices = e.value;
		const t = this.transformManager.transformControls.object;
		if (this.isDraggingVertices && t) {
			this.gizmoStartPosition.copy(t.position), this.initialVertexPositions.clear();
			const e = this.targetObject.geometry.getAttribute("position");
			this._getAffectedVertexIndices()
				.forEach(t => {
					this.initialVertexPositions.set(t, new THREE.Vector3()
						.fromBufferAttribute(e, t))
				})
		} else if (!this.isDraggingVertices && this.initialVertexPositions.size > 0) {
			const e = Array.from(this.initialVertexPositions.keys()),
				t = Array.from(this.initialVertexPositions.values()),
				i = e.map(e => new THREE.Vector3()
					.fromBufferAttribute(this.targetObject.geometry.getAttribute("position"), e)),
				s = new MoveVerticesCommand(this.objectManager, this.targetObject.uuid, e, t, i);
			this.historyManager.add(s), this.initialVertexPositions.clear()
		}
	}
	_getAffectedVertexIndices() {
		const e = new Set;
		if (this.selectionMode === "VERTEX") this.selectedIndices.forEach(t => e.add(t));
		else if (this.selectionMode === "FACE") {
			const t = this.targetObject.geometry.index;
			this.selectedIndices.forEach(i => {
				const s = this.quadMap.get(i);
				s.forEach(i => {
					e.add(t.getX(3 * i)), e.add(t.getX(3 * i + 1)), e.add(t.getX(3 * i + 2))
				})
			})
		} else if (this.selectionMode === "EDGE")
			for (const t of this.edgeMap.values()) this.selectedIndices.has(t.index) && (e.add(t.vertices[0]), e.add(t.vertices[1]));
		return e
	}
	onSubObjectMoved() {
		const e = this.transformManager.transformControls.object;
		if (!e || !this.isDraggingVertices) return;
		const t = new THREE.Vector3()
			.subVectors(e.position, this.gizmoStartPosition),
			i = this.targetObject.matrixWorld.clone()
			.invert(),
			s = t.applyMatrix4(new THREE.Matrix4()
				.extractRotation(i)),
			n = this.targetObject.geometry.getAttribute("position");
		this.initialVertexPositions.forEach((e, t) => {
			n.setXYZ(t, e.x + s.x, e.y + s.y, e.z + s.z)
		}), n.needsUpdate = !0, this.targetObject.geometry.computeVertexNormals(), this.edgeHelper && (this.edgeHelper.geometry.dispose(), this.edgeHelper.geometry = new THREE.EdgesGeometry(this.targetObject.geometry, 1)), this._updateSelectionVisuals()
	}
	
	
	_findClosestVertexToMouse() {
	    const camera = this.transformManager.camera;
	    const rect = this.transformManager.domElement.getBoundingClientRect();
	    const mousePixels = new THREE.Vector2(this.mouse.x * (rect.width / 2), this.mouse.y * (rect.height / 2));
	    
	    let closestVertexIndex = -1;
	    let minDistanceSq = Infinity;
	    const posAttr = this.targetObject.geometry.getAttribute('position');
	    const worldMatrix = this.targetObject.matrixWorld;
	
	    for (let i = 0; i < posAttr.count; i++) {
	        const vertexWorldPos = new THREE.Vector3().fromBufferAttribute(posAttr, i).applyMatrix4(worldMatrix);
	        
	        // Frustum culling: if point is behind camera, skip
	        const projected = vertexWorldPos.clone().project(camera);
	        if (projected.z > 1) continue;
	
	        const vertexPixels = new THREE.Vector2(projected.x * (rect.width / 2), projected.y * (rect.height / 2));
	        const distSq = mousePixels.distanceToSquared(vertexPixels);
	
	        if (distSq < minDistanceSq) {
	            minDistanceSq = distSq;
	            closestVertexIndex = i;
	        }
	    }
	
	    const pixelThreshold = 12; // A slightly larger threshold for points
	    return minDistanceSq < (pixelThreshold * pixelThreshold) ? closestVertexIndex : -1;
	}
	
	_getBoundaryEdgesOfQuad(quadIndex) {
	    const boundaryEdges = new Set();
	    const tris = this.quadMap.get(quadIndex);
	    const indexAttr = this.targetObject.geometry.index;
	    if (!tris || !indexAttr) return boundaryEdges;
	
	    const allEdgeKeys = new Set();
	    const sharedEdgeKeys = new Set();
	
	    tris.forEach(triIndex => {
	        const triVerts = [
	            indexAttr.getX(triIndex * 3),
	            indexAttr.getX(triIndex * 3 + 1),
	            indexAttr.getX(triIndex * 3 + 2)
	        ];
	        for (let i = 0; i < 3; i++) {
	            const v1 = triVerts[i];
	            const v2 = triVerts[(i + 1) % 3];
	            const key = v1 < v2 ? `${v1}-${v2}` : `${v2}-${v1}`;
	            if (allEdgeKeys.has(key)) {
	                sharedEdgeKeys.add(key);
	            } else {
	                allEdgeKeys.add(key);
	            }
	        }
	    });
	
	    this.edgeMap.forEach(edge => {
	        const key = edge.vertices[0] < edge.vertices[1] ? `${edge.vertices[0]}-${edge.vertices[1]}` : `${edge.vertices[1]}-${edge.vertices[0]}`;
	        if (allEdgeKeys.has(key) && !sharedEdgeKeys.has(key)) {
	            boundaryEdges.add(edge);
	        }
	    });
	
	    return boundaryEdges;
	}
	
	

	_getCurrentlySelectedFaces() {
	    const faces = new Set();
	    if (!this.isActive) return faces;
	
	    if (this.selectionMode === 'FACE') {
	        // If in face mode, the selected indices are the faces.
	        return new Set(this.selectedIndices);
	    } 
	    
	    // Check for implied face selection in other modes.
	    this.quadMap.forEach((tris, quadIdx) => {
	        if (this.selectionMode === 'VERTEX') {
	            const quadVerts = this._getVerticesOfQuad(quadIdx);
	            // If all vertices of a face are selected...
	            if (quadVerts.size > 0 && Array.from(quadVerts).every(v => this.selectedIndices.has(v))) {
	                faces.add(quadIdx);
	            }
	        } else if (this.selectionMode === 'EDGE') {
	            const quadBoundaryEdges = this._getBoundaryEdgesOfQuad(quadIdx);
	            // If all BOUNDARY edges of a face are selected...
	            if (quadBoundaryEdges.size > 0 && Array.from(quadBoundaryEdges).every(e => this.selectedIndices.has(e.index))) {
	                faces.add(quadIdx);
	            }
	        }
	    });
	
	    return faces;
	}
}