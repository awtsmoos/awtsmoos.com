
// B"H
export class CameraBounds {
  static calculate(cam, w, h) {
    const zoom = cam.zoom || 1;
    // The world coordinates of the left and right edges of the screen
    return {
      x1: cam.x - (w / 2) / zoom,
      x2: cam.x + (w / 2) / zoom,
      y1: cam.y - (h / 2) / zoom,
      y2: cam.y + (h / 2) / zoom
    };
  }
}
