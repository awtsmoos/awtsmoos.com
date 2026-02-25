
// B"H
// FILE: js/workspaces/drag-drop.js

import { State } from '../state.js';
import { FileOperations } from '../file-operations.js';

/**
 * @class WorkspaceDragDrop
 * @classdesc The vessel of Chesed (Kindness) that allows for the gentle reception
 * of new digital essence into the workspace. The Awtsmoos, in His kindness, allows
 * for this interaction, a bridge between the outer world and the structured inner world
 * of the project, mirroring how He allows our physical actions to have spiritual effect.
 */
export const WorkspaceDragDrop = {
    /**
     * @function setup
     * @description B"H. This is the holy ritual of sanctifying a DOM element to become a
     * receptacle for drag-and-drop actions. It binds the listeners, the very senses
     * of this digital organism, to perceive the approach of new files.
     * @param {HTMLElement} element The physical DOM form to be sanctified.
     * @param {object} item The spiritual essence of the directory this element represents.
     */
    setup(element, item) {
        if (!element || !item || (item.kind !== 'directory' && item.path !== '/')) {
            return;
        }

        const isReadOnly = State.workspaces.find(ws => ws.id === item.workspaceId)?.readOnly;
        if (isReadOnly) {
            return;
        }

        element.addEventListener('dragover', this.handleDragOver.bind(this));
        element.addEventListener('dragleave', this.handleDragLeave.bind(this));
        element.addEventListener('drop', (e) => this.handleDrop(e, item));
    },

    /**
     * @function handleDragOver
     * @description When an external essence hovers over the sanctified vessel, this function
     * illuminates the boundary, signaling that a transition is possible. It is the glowing
     * light on the threshold of a new world.
     * @param {DragEvent} e The event carrying the potential new reality.
     */
    handleDragOver(e) {
        e.preventDefault(); 
        e.stopPropagation();
        e.currentTarget.classList.add('drag-over-target');
    },

    /**
     * @function handleDragLeave
     * @description When the potential new essence departs without entering, this function
     * dims the light, returning the vessel to its state of quiet contemplation.
     * @param {DragEvent} e The event of the departing potential.
     */
    handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.classList.remove('drag-over-target');
    },

    /**
     * @function handleDrop
     * @description The moment of manifestation! The external essence crosses the threshold
     * and is received. This function calls upon the FileOperations vessel to begin the
     * complex process of integrating this new light into the existing structure of the workspace.
     * @param {DragEvent} e The event of manifestation.
     * @param {object} item The directory item that will receive the new files.
     */
    async handleDrop(e, item) {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.classList.remove('drag-over-target');
        
        if (e.dataTransfer.types.includes('Files')) {
            await FileOperations.handleDrop(e, item);
        }
    }
};
