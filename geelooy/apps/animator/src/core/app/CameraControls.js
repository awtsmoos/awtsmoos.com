
/* B”H */

/**
 * @class CameraControls
 * @description
 * THE EYE OF PROVIDENCE (Ein Hashgacha). 
 * 
 * RECTIFICATION (The Infinite Zoom Paradox):
 * Previously, zooming magnified the world from coordinate 0,0, causing 
 * characters on the edge of the screen to fly off into the void. 
 * Now, the zoom calculates the un-projected World X/Y of the mouse cursor, 
 * applies the magnification, and dynamically pans the camera to keep 
 * the target pixel perfectly centered under the cursor.
 */
export class CameraControls {
  static setup(app) {
    const stage = document.getElementById('main-stage');
    if (!stage) return;

    let isDragging = false;
    let lastPos = { x: 0, y: 0 };

    stage.addEventListener('mousedown', (e) => { 
      // Only pan if clicking on the background, not on a UI element
      if (e.target.closest('.workspace-overlay') || e.target.closest('.hud-overlay')) return;
      
      isDragging = true; 
      lastPos = { x: e.clientX, y: e.clientY }; 
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - lastPos.x;
      const dy = e.clientY - lastPos.y;
      app.ctx.camera.pan(dx, dy);
      lastPos = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => isDragging = false);
    window.addEventListener('mouseleave', () => isDragging = false);

    stage.addEventListener('wheel', (e) => {
      if (e.target.closest('.workspace-overlay') || e.target.closest('.hud-overlay')) return;
      e.preventDefault();
      
      const rect = stage.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      
      const cam = app.ctx.camera;
      const oldZoom = cam.zoom;
      
      // Smooth zoom delta
      const zoomDelta = e.deltaY * 0.0015;
      const newZoom = Math.max(0.1, Math.min(10, oldZoom - zoomDelta));
      
      if (newZoom === oldZoom) return;

      // 1. Where is the mouse currently pointing in the world?
      const wx = (mx - app.ctx.width / 2) / oldZoom + cam.x;
      const wy = (my - app.ctx.height * 0.82) / oldZoom + cam.y;
      
      // 2. Apply the zoom level
      cam.setZoom(newZoom);
      
      // 3. Where would that same world point be on the screen NOW?
      const wxAfter = (mx - app.ctx.width / 2) / newZoom + cam.x;
      const wyAfter = (my - app.ctx.height * 0.82) / newZoom + cam.y;
      
      // 4. Adjust the camera panning to eliminate the difference!
      // Since Camera.pan divides by zoom, we pass physical screen pixels
      const dx = (wxAfter - wx) * newZoom;
      const dy = (wyAfter - wy) * newZoom;
      
      cam.pan(dx, dy);

    }, { passive: false });
  }
}
