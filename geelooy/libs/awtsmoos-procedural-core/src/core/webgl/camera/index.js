
// B"H
/**
 * @file index.js (Camera)
 * @brief High-level camera management, exposing a unified view and projection interface.
 */
import { CameraState } from './state.js';
import { calculatePerspectiveMatrix } from './projection.js';
import { calculateViewMatrix } from './view.js';

export class Camera {
    constructor() {
        this.state = new CameraState();
        this.projectionMatrix = new Float32Array(16);
        this.viewMatrix = new Float32Array(16);
        this.update();
        console.log('B"H - Camera System: Online and beholding the infinite.');
    }

    update() {
        if (!this.state.isDirty) return;
        
        this.projectionMatrix = calculatePerspectiveMatrix(this.state);
        this.viewMatrix = calculateViewMatrix(this.state);
        
        this.state.isDirty = false;
    }

    getProjection() { return this.projectionMatrix; }
    getView() { return this.viewMatrix; }

    lookAt(pos, target) {
        if (!pos || !target) return;
        this.state.target = [...target];
        const dx = pos[0] - target[0];
        const dy = pos[1] - target[1];
        const dz = pos[2] - target[2];
        this.state.radius = Math.sqrt(dx*dx + dy*dy + dz*dz);
        
        // B"H - Safe inverse trig to prevent NaN
        const r_xz = Math.sqrt(dx*dx + dz*dz);
        this.state.beta = Math.atan2(dy, r_xz);
        this.state.alpha = Math.atan2(dx, dz);
        
        this.state.isDirty = true;
        this.update();
    }

    reset() {
        this.state.reset();
        this.update();
    }
}
