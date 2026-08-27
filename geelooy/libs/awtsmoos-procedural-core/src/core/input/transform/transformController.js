
/**
 * B"H
 * THE HAND OF MOVEMENT (TRANSFORM CONTROLLER)
 * 
 * Chapter: The Revelation of the True Path
 * Ah! The image reveals the hidden truth! The physical file resides not in 
 * `interaction/transformController.js`, but rather in the deeper chamber of 
 * `transform/transformController.js`! The browser was loading the old, shattered 
 * scroll while we were writing to a phantom location. 
 * 
 * We now strike directly at the heart of `core/input/transform/transformController.js`.
 * We banish the phantom `RayProjector` entirely. We call upon `CameraUnprojector`
 * to bridge the gap between Malchus (the earthly mouse) and the upper realms 
 * of the 3D Canvas. We also bring in `RayMath` to handle the pure plane intersection.
 * 
 * @module TransformController
 */

import { CameraUnprojector, ScenePicker, RayMath } from '../../physics/raycast/index.js';
import { ColorHighlighter } from '../interaction/modules/colorHighlighter.js';

export class TransformController {
    /**
     * B"H
     * Initiates the connection between the user and the geometric reality.
     * @param {Object} renderer - The engine orchestrating the manifestation.
     */
    constructor(renderer) {
        this.renderer = renderer;
        this.canvas = renderer.canvas;
        
        this.isDragging = false;
        this.selectedObject = null;
        
        // The metaphysical plane upon which the object slides
        this.dragPlaneNormal = [0, 0, 1]; 
        this.dragPlanePoint = [0, 0, 0];
        this.dragOffset = [0, 0, 0];

        // Bindings for the physical domain
        this._onMouseDown = this.onMouseDown.bind(this);
        this._onMouseMove = this.onMouseMove.bind(this);
        this._onMouseUp = this.onMouseUp.bind(this);
    }

    /**
     * B"H - Opens the gates of interaction.
     */
    enable() {
        this.canvas.addEventListener('mousedown', this._onMouseDown);
        this.canvas.addEventListener('mousemove', this._onMouseMove);
        window.addEventListener('mouseup', this._onMouseUp);
        console.log('B"H - TransformController: Online. The ghost of RayProjector is banished from the correct directory!');
    }

    /**
     * B"H - Closes the gates and releases all earthly attachments.
     */
    disable() {
        this.canvas.removeEventListener('mousedown', this._onMouseDown);
        this.canvas.removeEventListener('mousemove', this._onMouseMove);
        window.removeEventListener('mouseup', this._onMouseUp);
        this.isDragging = false;
        this.selectedObject = null;
    }

    /**
     * B"H
     * Forges the Ray from the earthly screen coordinates using the purified Unprojector.
     * @param {MouseEvent} e - The physical touch.
     * @returns {Object|null} The infinite line of intent {origin, direction}.
     */
    _getRay(e) {
        if (!this.renderer || !this.renderer.camera) return null;

        const rect = this.canvas.getBoundingClientRect();
        const cssX = e.clientX - rect.left;
        const cssY = e.clientY - rect.top;
        
        // Map to Normalized Device Coordinates (NDC) [-1 to 1]
        const ndcX = (cssX / rect.width) * 2.0 - 1.0;
        const ndcY = 1.0 - (cssY / rect.height) * 2.0;
        
        return CameraUnprojector.unproject(ndcX, ndcY, this.renderer.camera);
    }

    /**
     * B"H
     * The moment of willful connection (Mouse Down).
     */
    onMouseDown(e) {
        // Only react to the primary intent (Left Click)
        if (e.button !== 0) return;
        
        // Requirement for some systems to differentiate Orbiting from Dragging
        // This is the standard 3D editor pattern: Shift + drag on interactive object
        if (!e.shiftKey) return; 

        const ray = this._getRay(e);
        if (!ray) return;

        // Ask the ScenePicker for the closest truth
        const result = ScenePicker.pick(ray, this.renderer.objectMap, this.renderer, false);

        if (result && result.object) {
            this.selectedObject = result.object;
            this.isDragging = true;
            
            const hitPoint = result.point;
            
            // Seek the true position of the vessel
            const objPos = this.selectedObject.position || 
                           (this.selectedObject.keyframes && this.selectedObject.keyframes[0]?.position) || 
                           [0, 0, 0];

            // Establish the invisible Drag Plane (Parsa)
            // The plane faces the camera exactly, anchored at the hit point.
            // Direction from Camera to Object (reversed) serves as the Plane Normal.
            const camPos = ray.origin;
            this.dragPlaneNormal = RayMath.normalize(RayMath.sub(camPos, hitPoint));
            this.dragPlanePoint = [...hitPoint];

            // Record the offset from the click point to the object's true center
            // This prevents the object from violently snapping its center to the mouse pointer.
            this.dragOffset = RayMath.sub(objPos, hitPoint);

            // Highlight the vessel to indicate it is seized
            ColorHighlighter.highlight(this.selectedObject, [1.0, 0.5, 0.0]); // Orange glow

            console.log(`B"H - ✋ Seized vessel: [${this.selectedObject.id}] for dimensional shifting.`);
        }
    }

    /**
     * B"H
     * The shifting of the geometry across the void (Mouse Move).
     */
    onMouseMove(e) {
        if (!this.isDragging || !this.selectedObject) return;

        const ray = this._getRay(e);
        if (!ray) return;

        // Find exactly where the new Ray pierces the invisible Drag Plane
        const t = RayMath.intersectPlane(ray.origin, ray.direction, this.dragPlaneNormal, this.dragPlanePoint);
        
        if (t !== null && t > 0) {
            // Calculate absolute world coordinate on the plane
            const planeHit = RayMath.add(ray.origin, RayMath.scale(ray.direction, t));
            
            // Apply the initial offset
            const newPos = RayMath.add(planeHit, this.dragOffset);

            // Update the vessel's absolute position
            if (this.selectedObject.keyframes && this.selectedObject.keyframes.length > 0) {
                this.selectedObject.keyframes[0].position = [...newPos];
            } else {
                this.selectedObject.position = [...newPos];
            }
            
            // Mark the vessel as dirty to force a re-manifestation (matrix rebuild)
            this.selectedObject.dirty = true;
            if (this.selectedObject.worldMatrix) {
                this.selectedObject.worldMatrix = null; 
            }
        }
    }

    /**
     * B"H
     * Relinquishing control back to the natural order (Mouse Up).
     */
    onMouseUp(e) {
        if (e.button !== 0) return;
        if (this.isDragging) {
            console.log(`B"H - 🤚 Released vessel: [${this.selectedObject?.id}]. Let it rest in its new reality.`);
            
            // Remove the seize highlight
            if (this.selectedObject) {
                ColorHighlighter.reset(this.selectedObject);
            }

            this.isDragging = false;
            this.selectedObject = null;
        }
    }
}
