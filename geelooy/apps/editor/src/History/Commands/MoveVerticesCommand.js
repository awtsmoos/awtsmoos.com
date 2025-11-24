// B"H
import { Command } from '../../Core/Command.js';

export class MoveVerticesCommand extends Command {
    /**
     * @param {ObjectManager} objectManager - To get the object by UUID.
     * @param {string} objectUUID - The UUID of the mesh being edited.
     * @param {Array<number>} indices - Array of vertex indices that were moved.
     * @param {Array<THREE.Vector3>} oldPositions - Array of original vertex positions.
     * @param {Array<THREE.Vector3>} newPositions - Array of new vertex positions.
     */
    constructor(objectManager, objectUUID, indices, oldPositions, newPositions) {
        super();
        this.objectManager = objectManager;
        this.objectUUID = objectUUID;
        this.indices = [...indices];
        this.oldPositions = oldPositions.map(p => p.clone());
        this.newPositions = newPositions.map(p => p.clone());
        this.name = `Move Vertices`;
    }

    _applyPositions(positions) {
        const object = this.objectManager.getObjectByUUID(this.objectUUID);
        if (!object || !object.isMesh || !object.geometry.getAttribute('position')) {
            console.error("Cannot apply vertex positions: Object not found or is not a valid mesh.");
            return;
        }

        const positionAttribute = object.geometry.getAttribute('position');
        this.indices.forEach((index, i) => {
            positionAttribute.setXYZ(index, positions[i].x, positions[i].y, positions[i].z);
        });

        positionAttribute.needsUpdate = true;
        object.geometry.computeVertexNormals(); // Recalculate normals for correct lighting
        
        // Notify that the object's geometry has changed
        this.objectManager.eventEmitter.emit('geometryChanged', { uuid: this.objectUUID });
    }

    execute() {
        this._applyPositions(this.newPositions);
    }

    undo() {
        this._applyPositions(this.oldPositions);
    }
}