// B"H
import * as THREE from 'three';
import { Command } from '../../Core/Command.js';

export class SubdivideFacesCommand extends Command {
    constructor(objectManager, objectUUID, faceIndices, editModeManager) {
        super();
        this.objectManager = objectManager;
        this.objectUUID = objectUUID;
        this.faceIndices = [...faceIndices]; // The indices of the QUADS to subdivide
        this.editModeManager = editModeManager; // To access quad/edge maps

        this.oldPositions = null;
        this.oldIndices = null;
        this.newSelection = null;
        this.name = `Subdivide Face(s)`;
    }

    execute() {
    const object = this.objectManager.getObjectByUUID(this.objectUUID);
    if (!object) return;

    const geometry = object.geometry;
    const oldPosAttr = geometry.getAttribute('position');
    const oldIndexAttr = geometry.index;

    // Store old state for undo
    this.oldPositions = oldPosAttr.clone();
    this.oldIndices = oldIndexAttr.clone();

    const newVertices = Array.from(oldPosAttr.array);
    const edgeMidpointCache = new Map(); // Key: "v1-v2", Value: new vertex index

    // 1. Build a list of triangles to keep (from non-subdivided faces)
    const finalTriangles = [];
    const subdividedQuadIndices = new Set(this.faceIndices);

    for (const [quadIndex, triIndices] of this.editModeManager.quadMap.entries()) {
        if (!subdividedQuadIndices.has(quadIndex)) {
            triIndices.forEach(triIndex => {
                finalTriangles.push(
                    oldIndexAttr.getX(triIndex * 3),
                    oldIndexAttr.getX(triIndex * 3 + 1),
                    oldIndexAttr.getX(triIndex * 3 + 2)
                );
            });
        }
    }
    
    // 2. Process each subdivided face
    this.faceIndices.forEach(quadIndex => {
        const corners = this.editModeManager._getOrderedVerticesOfQuad(quadIndex);
        if (!corners || corners.length !== 4) return; // Skip if not a proper quad

        // a. Calculate center point
        const centerPos = new THREE.Vector3();
        corners.forEach(vIdx => centerPos.add(new THREE.Vector3().fromBufferAttribute(oldPosAttr, vIdx)));
        centerPos.divideScalar(4);
        const centerIdx = newVertices.length / 3;
        newVertices.push(centerPos.x, centerPos.y, centerPos.z);

        // b. Calculate midpoints for the 4 boundary edges
        const midIndices = [];
        for (let i = 0; i < 4; i++) {
            const v1_idx = corners[i];
            const v2_idx = corners[(i + 1) % 4];
            const edgeKey = v1_idx < v2_idx ? `${v1_idx}-${v2_idx}` : `${v2_idx}-${v1_idx}`;

            if (edgeMidpointCache.has(edgeKey)) {
                midIndices.push(edgeMidpointCache.get(edgeKey));
            } else {
                const midPos = new THREE.Vector3()
                    .fromBufferAttribute(oldPosAttr, v1_idx)
                    .add(new THREE.Vector3().fromBufferAttribute(oldPosAttr, v2_idx))
                    .multiplyScalar(0.5);
                const newMidIdx = newVertices.length / 3;
                newVertices.push(midPos.x, midPos.y, midPos.z);
                edgeMidpointCache.set(edgeKey, newMidIdx);
                midIndices.push(newMidIdx);
            }
        }
        
        // c. Create 4 new quads (8 triangles) from the new points
        for (let i = 0; i < 4; i++) {
            const cornerIdx = corners[i];
            const midIdx = midIndices[i];
            const prevMidIdx = midIndices[(i + 3) % 4];

            // Triangle 1: corner -> mid -> center
            finalTriangles.push(cornerIdx, midIdx, centerIdx);
            // Triangle 2: corner -> center -> prev_mid
            finalTriangles.push(cornerIdx, centerIdx, prevMidIdx);
        }
    });
    
    // 3. Apply new geometry data
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(newVertices, 3));
    geometry.setIndex(finalTriangles);
    geometry.computeVertexNormals();

    // 4. Update the editor state
    this.editModeManager.selectedIndices.clear();
    this.editModeManager._buildEdgeMap();
    this.editModeManager._buildQuadMap();
    this.editModeManager.eventEmitter.emit('selectionChanged', []);
    this.editModeManager._updateSelectionVisuals();
    this.editModeManager.updateGizmoPosition();

    this.objectManager.eventEmitter.emit('geometryChanged', { uuid: this.objectUUID });
}

    undo() {
        const object = this.objectManager.getObjectByUUID(this.objectUUID);
        if (!object || !this.oldPositions || !this.oldIndices) return;

        const geometry = object.geometry;
        geometry.setAttribute('position', this.oldPositions);
        geometry.setIndex(this.oldIndices);
        geometry.computeVertexNormals();

        // Restore editor state
        this.editModeManager.selectedIndices = new Set(this.faceIndices);
        this.editModeManager._buildEdgeMap();
        this.editModeManager._buildQuadMap();
        this.editModeManager._updateSelectionVisuals();
        this.editModeManager.updateGizmoPosition();

        this.objectManager.eventEmitter.emit('geometryChanged', { uuid: this.objectUUID });
    }
}