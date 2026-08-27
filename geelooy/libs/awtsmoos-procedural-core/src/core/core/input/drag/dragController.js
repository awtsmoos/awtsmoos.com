
// B"H
/**
 * @file dragController.js
 * @brief The Hand of Providence. Casts rays to drag physical vessels through space.
 * 
 * THE PSALM OF THE GUIDING HAND:
 * The Golem stands still until the Master commands,
 * Moving the vessels with invisible hands!
 * The new Ray Projector forms the beam of light,
 * And the Scene Picker fetches the object from the night!
 */

import { RayProjector, ScenePicker, Intersections } from '../../physics/raycast/index.js';
import { VirtualViewport } from '../../geometry/selection/virtualViewport.js';
import { Vec3 } from '../../math/vec3.js';

export class DragController {
    /**
     * @param {Object} renderer - The Master Renderer
     */
    constructor(renderer) {
        this.renderer = renderer;
        this.activeObject = null;
        this.planeNormal = [0, 0, 1];
        this.dragOffset = [0, 0, 0];
        
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
    }

    enable() {
        const canvas = this.renderer.canvas;
        canvas.addEventListener('mousedown', this.onMouseDown);
        window.addEventListener('mousemove', this.onMouseMove);
        window.addEventListener('mouseup', this.onMouseUp);
        console.log('B"H - DragController: The Hand of Providence is active.');
    }

    disable() {
        const canvas = this.renderer.canvas;
        canvas.removeEventListener('mousedown', this.onMouseDown);
        window.removeEventListener('mousemove', this.onMouseMove);
        window.removeEventListener('mouseup', this.onMouseUp);
    }

    _getRay(e) {
        const rect = this.renderer.canvas.getBoundingClientRect();
        const proj = this.renderer.camera.getProjection();
        const view = this.renderer.camera.getView();
        
        return RayProjector.unproject(
            e.clientX - rect.left, 
            e.clientY - rect.top, 
            rect.width, 
            rect.height, 
            proj, 
            view
        );
    }

    onMouseDown(e) {
        if (e.button !== 0) return; // Only Left Click commands the drag
        
        const ray = this._getRay(e);
        if (!ray) return;

        // B"H - Utilize the pure ScenePicker
        const pickResult = ScenePicker.pick(ray, this.renderer.objectMap, this.renderer);
        const selected = pickResult ? pickResult.object : null;

        if (selected && selected.draggable) {
            this.activeObject = selected;
            const camState = this.renderer.camera.state;
            const camPos = [
                camState.target[0] + camState.radius * Math.cos(camState.beta) * Math.sin(camState.alpha),
                camState.target[1] + camState.radius * Math.sin(camState.beta),
                camState.target[2] + camState.radius * Math.cos(camState.beta) * Math.cos(camState.alpha)
            ];
            
            // The plane faces the camera
            this.planeNormal = Vec3.normalize(Vec3.sub(camPos, camState.target));
            
            const pos = this.activeObject.keyframes[0].position;
            
            // Determine exact hit distance for offset
            // We use the object's computed bounding sphere for stability
            let hitDist = 0;
            if (this.activeObject.boundingSphere) {
                hitDist = Intersections.raySphere(ray, pos, this.activeObject.boundingSphere.radius) || 0;
            }
            
            const hitPoint = Vec3.add(ray.origin, Vec3.scale(ray.direction, hitDist));
            this.dragOffset = Vec3.sub(pos, hitPoint);
            
            // Silence the orbit controls
            if (this.renderer.orbitControls) this.renderer.orbitControls.isDragging = false;
            window.__IS_DRAGGING_OBJECT__ = true;
        }
    }

    onMouseMove(e) {
        if (!this.activeObject) return;

        const ray = this._getRay(e);
        if (!ray) return;

        const pos = this.activeObject.keyframes[0].position;
        const denom = Vec3.dot(ray.direction, this.planeNormal);
        
        if (Math.abs(denom) > 1e-6) {
            const p0l0 = Vec3.sub(pos, ray.origin);
            const t = Vec3.dot(p0l0, this.planeNormal) / denom;
            if (t >= 0) {
                const newHit = Vec3.add(ray.origin, Vec3.scale(ray.direction, t));
                this.activeObject.keyframes[0].position = Vec3.add(newHit, this.dragOffset);
                this.activeObject.isMoving = true; // Signal the LiveCSGSystem!
            }
        }
    }

    onMouseUp(e) {
        if (this.activeObject) {
            this.activeObject.isMoving = false;
            this.activeObject = null;
            window.__IS_DRAGGING_OBJECT__ = false;
        }
    }
}
