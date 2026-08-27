
/* B”H */

/**
 * @class TransformGizmo
 * @description
 * THE VESSEL OF MEASUREMENT (Kli HaMiddot).
 * Renders the visual handles (boxes, rotation anchors) around the currently 
 * selected entity, proving to the Creator that the entity is grasped.
 * It does not use the DOM, but paints directly onto the sacred Canvas 
 * using the camera's reverse transform.
 */
export class TransformGizmo {
  /**
   * Draws the active selection handles.
   * @param {CanvasRenderingContext2D} ctx - The physical plane.
   * @param {Object} state - The global state.
   */
  static draw(ctx, state) {
    const selectedId = state.get('selected_entity_id');
    if (!selectedId) return;

    // 1. Locate the entity across the dimensions
    let entity = null;
    let type = '';
    
    const chars = state.get('characters');
    if (chars && chars[selectedId]) {
      entity = chars[selectedId];
      type = 'character';
    } else {
      const scene = state.get('scene');
      const objects = [...(scene.foliage || []), ...(scene.buildings || []), ...(scene.mountains || [])];
      entity = objects.find(o => o.id === selectedId || `bld_${o.x}` === selectedId || `mnt_${o.x}` === selectedId || `tree_${o.x}` === selectedId);
      type = 'scene';
    }

    if (!entity) return;

    ctx.save();
    
    // 2. Establish Bounding Box Dimensions
    let x, y, w, h;
    
    if (type === 'character') {
      x = entity.position.x;
      y = entity.position.y;
      w = 120 * (entity.scale || 1);
      h = 300 * (entity.scale || 1);
      ctx.translate(x, y - h/2 + 50); // Center roughly on torso
    } else {
      x = entity.x;
      y = entity.y;
      w = entity.w || entity.size || 200;
      h = entity.h || entity.size || 200;
      ctx.translate(x + w/2, y - h/2);
    }

    // 3. Draw the Holy Perimeter (Neon Outline)
    ctx.strokeStyle = '#00ffcc';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(-w/2, -h/2, w, h);
    ctx.setLineDash([]);

    // 4. Draw Transformation Corners (Anchors of Gevurah)
    ctx.fillStyle = '#00ffcc';
    const s = 10; // Handle size
    ctx.fillRect(-w/2 - s/2, -h/2 - s/2, s, s); // Top Left
    ctx.fillRect(w/2 - s/2, -h/2 - s/2, s, s);  // Top Right
    ctx.fillRect(-w/2 - s/2, h/2 - s/2, s, s);  // Bottom Left
    ctx.fillRect(w/2 - s/2, h/2 - s/2, s, s);   // Bottom Right

    // 5. Draw Rotation Antenna (Keter)
    ctx.beginPath();
    ctx.moveTo(0, -h/2);
    ctx.lineTo(0, -h/2 - 30);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, -h/2 - 35, 6, 0, Math.PI*2);
    ctx.fill();

    ctx.restore();
  }
}
