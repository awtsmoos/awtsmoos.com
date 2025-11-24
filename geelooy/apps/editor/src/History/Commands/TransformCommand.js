// B"H
import * as THREE from 'three';
import { Command } from '../../Core/Command.js';

export class TransformCommand extends Command {
    constructor(eventEmitter, startState, endState) {
        super();
        this.eventEmitter = eventEmitter; // Needed to find objects by UUID via ObjectManager potentially
        this.startState = this._cloneState(startState);
        this.endState = this._cloneState(endState);
        this.objectUUIDs = Array.isArray(startState) ? startState.map(s => s.uuid) : [startState.uuid];
        this.name = `Transform Object(s)`; // TODO: Be more specific (Move, Rotate, Scale)?
    }

    _cloneState(state) {
        if (Array.isArray(state)) {
            return state.map(s => ({ ...s })); // Shallow clone is enough for stored vectors/quats
        }
        return { ...state };
    }

    _applyState(state) {
        const objectManager = window.MWA.objectManager; // Access global for simplicity (or pass Editor)
        if (!objectManager) {
             console.error("ObjectManager not found for TransformCommand");
             return;
        }

        const statesToApply = Array.isArray(state) ? state : [state];

        statesToApply.forEach(s => {
            const object = objectManager.getObjectByUUID(s.uuid);
            if (object) {
                object.position.copy(s.position);
                 // Apply rotation carefully - use quaternion if available
                 if (s.quaternion) {
                    object.quaternion.copy(s.quaternion);
                 } else {
                    object.rotation.copy(s.rotation); // Fallback to Euler if needed
                 }
                object.scale.copy(s.scale);
                object.updateMatrixWorld(); // Ensure matrix is updated
            } else {
                console.warn(`Object ${s.uuid} not found during transform apply.`);
            }
        });
         // Notify that objects were updated
         this.eventEmitter.emit('objectTransformed', objectManager.getObjectsByIds(this.objectUUIDs));
         this.eventEmitter.emit('sceneGraphChanged'); // May affect hierarchy indirectly
    }

    execute() {
        this._applyState(this.endState);
        console.log(`Executed TransformCommand for ${this.objectUUIDs.join(', ')}`);
    }

    undo() {
        this._applyState(this.startState);
        console.log(`Undone TransformCommand for ${this.objectUUIDs.join(', ')}`);
    }
}