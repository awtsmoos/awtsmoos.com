
// B"H
/**
 * @module MouseDragOrchestrator
 * @description
 * 🧭 CHAPTER 24: THE ORBIT OF THE SPHERES 🧭
 * 
 * "He suspends the earth over the void."
 * This module purely handles the mathematical rotation of the camera around the focal point.
 * It is invoked directly by the `cameraDrag` event emitted by the MouseEmissary.
 */

export default class MouseDragOrchestrator {
    /**
     * @method applyRotation
     * @description Adjusts the Theta (horizontal) and Phi (vertical) angles of the gaze.
     * @param {Object} cameraInstance - The `Ayin` instance.
     * @param {number} dx - The horizontal drag distance.
     * @param {number} dy - The vertical drag distance.
     */
    static applyRotation(cameraInstance, dx, dy) {
        if (!cameraInstance) return;

        cameraInstance.newMovement = true;
        const degreeToRadian = Math.PI / 180;
        
        // B"H: We apply the rotational intent. 
        // The speed is normalized against the screen dimensions to ensure 
        // the rotation feels consistent regardless of monitor size!
        const rotX = dx * (cameraInstance.xSpeed / cameraInstance.width);
        const rotY = dy * (cameraInstance.ySpeed / cameraInstance.height);

        cameraInstance.userInputTheta -= rotX * degreeToRadian * 50; 
        cameraInstance.userInputPhi -= rotY * degreeToRadian * 50;
    }
}
