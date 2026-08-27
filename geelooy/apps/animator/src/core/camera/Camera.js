
/* B”H */
import { CameraState } from './State.js';

/**
 * @class Camera
 * @description
 * THE LENS OF THE INFINITE (Adashat HaEin Sof).
 * B"H
 * 
 * RECTIFICATION (The Shield of Nullity):
 * Previously, if the universe was still in a state of Tohu (formlessness) 
 * and the 'camera' state had not yet been spoken into existence, reading `x` 
 * would shatter the engine with a TypeError. We have wrapped every getter in 
 * divine defensive fallbacks (Optional Chaining), ensuring the camera gracefully 
 * rests at the origin of space until commanded otherwise.
 */
export class Camera {
  constructor(state) {
    this.state = state;
  }

  get x() { return this.state.get('camera')?.x || 0; }
  get y() { return this.state.get('camera')?.y || -100; }
  get zoom() { return this.state.get('camera')?.zoom || 1.0; }

  pan(dx, dy) {
    const cam = this.state.get('camera') || { x: 0, y: -100, zoom: 1.0 };
    const zoom = cam.zoom || 1.0;
    this.state.set('camera', { 
      ...cam, 
      x: cam.x - dx / zoom, 
      y: cam.y - dy / zoom 
    });
  }

  setZoom(zoom) {
    const cam = this.state.get('camera') || { x: 0, y: -100, zoom: 1.0 };
    this.state.set('camera', { ...cam, zoom: Math.max(0.01, Math.min(10, zoom)) });
  }
}
