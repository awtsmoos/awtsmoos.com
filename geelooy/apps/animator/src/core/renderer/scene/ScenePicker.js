/* B”H */
export class ScenePicker {
  static pick(mx, my, scene, camera, width, height) {
    const camX = camera.x;
    const camY = camera.y;
    const zoom = camera.zoom;
    const centerX = width / 2;
    const centerY = height / 2;

    // Foliage (Parallax 1.0)
    let wx = (mx - centerX) / zoom + camX;
    let wy = (my - centerY) / zoom + camY;
    for (const item of (scene.foliage || [])) {
      if (this.hitTest(wx, wy, item.x - item.size/2, item.y - item.size, item.size, item.size)) {
        return { type: 'foliage', item };
      }
    }
    
    // Buildings (Parallax 0.7)
    wx = (mx - centerX) / zoom + camX * 0.7;
    wy = (my - centerY) / zoom + camY * 0.7;
    for (const item of (scene.buildings || [])) {
      if (this.hitTest(wx, wy, item.x, item.y - item.h, item.w, item.h)) {
        return { type: 'building', item };
      }
    }
    
    // Mountains (Parallax 0.2)
    wx = (mx - centerX) / zoom + camX * 0.2;
    wy = (my - centerY) / zoom + camY * 0.2;
    for (const item of (scene.mountains || [])) {
      if (this.hitTest(wx, wy, item.x, item.y - item.h, item.w, item.h)) {
        return { type: 'mountain', item };
      }
    }
    
    return null;
  }

  static hitTest(mx, my, x, y, w, h) {
    return mx >= x && mx <= x + w && my >= y && my <= y + h;
  }
}
