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
        let newIndices = Array.from(oldIndexAttr.array);
        const newQuadIndices = new Set();

        const vertexCache = new Map(); // Cache for new edge midpoints

        this.faceIndices.forEach(quadIndex => {
            const quadVertices = this.editModeManager._getVerticesOfQuad(quadIndex);
            const quadEdges = this.editModeManager._getEdgesOfQuad(quadIndex);
            
            if (quadVertices.size !== 4) return; // Only subdivide quads for now

            const centerPoint = new THREE.Vector3();
            quadVertices.forEach(vIdx => {
                centerPoint.add(new THREE.Vector3().fromBufferAttribute(oldPosAttr, vIdx));
            });
            centerPoint.divideScalar(quadVertices.size);

            const centerIndex = newVertices.length / 3;
            newVertices.push(centerPoint.x, centerPoint.y, centerPoint.z);

            const edgeMidIndices = new Map();
            quadEdges.forEach(edge => {
                const key = edge.vertices[0] < edge.vertices[1] ? `${edge.vertices[0]}-${edge.vertices[1]}` : `${edge.vertices[1]}-${edge.vertices[0]}`;
                if (!vertexCache.has(key)) {
                    const midPoint = new THREE.Vector3()
                        .fromBufferAttribute(oldPosAttr, edge.vertices[0])
                        .add(new THREE.Vector3().fromBufferAttribute(oldPosAttr, edge.vertices[1]))
                        .multiplyScalar(0.5);
                    const newIndex = newVertices.length / 3;
                    newVertices.push(midPoint.x, midPoint.y, midPoint.z);
                    vertexCache.set(key, newIndex);
                }
                edgeMidIndices.set(edge.index, vertexCache.get(key));
            });

            // Find corner points
            const corners = Array.from(quadVertices);

            // Create 4 new quads
            for(let i=0; i<4; i++) {
                const corner = corners[i];
                const nextCorner = corners[(i+1) % 4];
                const prevCorner = corners[(i+3) % 4];
                
                // Find the two edge midpoints connected to this corner
                let mid1, mid2;
                for(const [edgeIndex, midIndex] of edgeMidIndices.entries()) {
                    const edge = Array.from(this.editModeManager.edgeMap.values()).find(e=>e.index === edgeIndex);
                    if(edge.vertices.includes(corner) && edge.vertices.includes(nextCorner)) mid1 = midIndex;
                    if(edge.vertices.includes(corner) && edge.vertices.includes(prevCorner)) mid2 = midIndex;
                }

                if (mid1 !== undefined && mid2 !== undefined) {
                    // Add the two triangles for the new quad
                    newIndices.push(corner, mid1, centerIndex);
                    newIndices.push(corner, centerIndex, mid2);
                    newQuadIndices.add((newIndices.length / 3) - 2);
                }
            }
        });

        // Filter out the old triangles that made up the subdivided faces
        const trianglesToRemove = new Set();
        this.faceIndices.forEach(quadIndex => {
            const tris = this.editModeManager.quadMap.get(quadIndex);
            tris.forEach(triIndex => trianglesToRemove.add(triIndex));
        });
        
        newIndices = newIndices.filter((_, i) => !trianglesToRemove.has(Math.floor(i / 3)));
        
        // Apply new geometry data
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(newVertices, 3));
        geometry.setIndex(newIndices);
        geometry.computeVertexNormals();

        // Update the editor state
        this.editModeManager.selectedIndices = new Set(); // Clear old selection
        this.editModeManager._buildEdgeMap();
        this.editModeManager._buildQuadMap();
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