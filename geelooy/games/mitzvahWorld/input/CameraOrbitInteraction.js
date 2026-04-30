
import SederHishtalshelusNode from '../core/SederHishtalshelusNode.js';

/**
 * B"H
 * @file CameraOrbitInteraction.js
 * 
 * The eyes of the vessel must be able to rotate and perceive the
 * spiritual dimensions around them. But the UI (User Interface)
 * is a specific contraction (Tzimtzum) that demands focused attention.
 * 
 * Therefore, this class allows the camera to orbit the player ONLY
 * when the physical finger or mouse touches the void (the canvas/background),
 * completely ignoring touches upon the UI elements.
 */

/**
 * @class CameraOrbitInteraction
 * @extends SederHishtalshelusNode
 * @description Manages camera rotation through drag interactions, deeply respecting UI bounds.
 */
export default class CameraOrbitInteraction extends SederHishtalshelusNode {
    /**
     * @constructor
     * @param {Object} cameraState - Pure JSON reference to the camera's angles.
     */
    constructor(cameraState) {
        super({ worldName: "Yetzirah_Camera_Angles" });
        
        /**
         * Pure data state of the dragging interaction.
         * @type {Object}
         */
        this.dragState = {
            isDragging: false,
            previousX: 0,
            previousY: 0,
            sensitivity: 0.005
        };

        this.cameraState = cameraState || { theta: 0, phi: Math.PI / 4, radius: 10 };
        this.bindDivineEvents();
    }

    /**
     * @method isTouchInVoid
     * @description Checks if the touch was on the pure canvas or a UI element.
     * @param {Event} event - The DOM event.
     * @returns {boolean}
     */
    isTouchInVoid(event) {
        const target = event.target;
        // If it's a UI element, a button, input, or has a specific class, it's NOT the void.
        if (target.tagName === 'INPUT' || target.tagName === 'BUTTON' || target.closest('.ui-container')) {
            return false;
        }
        return true;
    }

    /**
     * @method bindDivineEvents
     * @description Attaches listeners to the document, channeling physical movement into digital rotation.
     * @returns {void}
     */
    bindDivineEvents() {
        document.addEventListener('pointerdown', (e) => {
            if (!this.isTouchInVoid(e)) return;
            this.dragState.isDragging = true;
            this.dragState.previousX = e.clientX;
            this.dragState.previousY = e.clientY;
        });

        document.addEventListener('pointermove', (e) => {
            if (!this.dragState.isDragging) return;

            const deltaX = e.clientX - this.dragState.previousX;
            const deltaY = e.clientY - this.dragState.previousY;

            this.cameraState.theta -= deltaX * this.dragState.sensitivity;
            this.cameraState.phi -= deltaY * this.dragState.sensitivity;

            // Constrain phi to prevent flipping the universe upside down (Tohu)
            this.cameraState.phi = Math.max(0.1, Math.min(Math.PI / 2 - 0.1, this.cameraState.phi));

            this.dragState.previousX = e.clientX;
            this.dragState.previousY = e.clientY;
        });

        document.addEventListener('pointerup', () => {
            this.dragState.isDragging = false;
        });
    }

    /**
     * @method getCameraState
     * @description Returns the pure data representation of the camera angles.
     * @returns {Object}
     */
    getCameraState() {
        return this.cameraState;
    }
}
