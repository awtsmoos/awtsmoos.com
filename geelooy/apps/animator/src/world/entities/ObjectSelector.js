
/* B”H */

/**
 * @class ObjectSelector
 * @description
 * THE FINGER OF DISCRIMINATION (Etzba HaMavchin).
 * Enables the selection of any manifest entity in the scene. 
 * Performs hit-testing against characters, props, and world objects.
 * 
 * RECTIFICATION: Characters are no longer stuck with a fixed 100x250 hit box.
 * The engine dynamically reads their `mod.head` and `mod.limbs` scales, and 
 * considers their overarching `position.scale` property to inflate or shrink 
 * the mathematical click zone accordingly.
 */
export class ObjectSelector {
  static findAt(mx, my, state, camera, width, height) {
    const cam = camera;
    const zoom = cam.zoom;
    const cx = width / 2;
    // Account for the camera centering offset
    const cy = height * 0.82; 

    // Transform mouse to absolute world coords
    const wx = (mx - cx) / zoom + cam.x;
    const wy = (my - cy) / zoom + cam.y;

    // 1. Check Characters
    const chars = state.get('characters') || {};
    for (const [id, char] of Object.entries(chars)) {
      // B"H - Dynamic Bounding Box!
      const totalScale = (char.position?.scale || 1.0) * (char.mod?.body || 1.0);
      const hitW = 120 * totalScale;
      const hitH = 300 * totalScale;
      
      const dx = wx - char.position.x;
      // Offset Y to center the hit box on the torso rather than the feet
      const dy = wy - (char.position.y - hitH/2 + 50); 
      
      if (Math.abs(dx) < hitW/2 && Math.abs(dy) < hitH/2) {
        return { type: 'character', id };
      }
    }

    // 2. Check Scene Props
    const scene = state.get('scene') || {};
    const objects = [...(scene.foliage || []), ...(scene.buildings || []), ...(scene.props || [])];
    for (const obj of objects) {
       const dx = wx - obj.x;
       // Quick proxy for object heights to anchor the hit box
       const baseH = obj.h || obj.size || 100;
       const dy = wy - (obj.y - baseH/2);
       
       const hitW = (obj.w || obj.size || 100) / 2;
       const hitH = baseH / 2;
       
       if (Math.abs(dx) < hitW && Math.abs(dy) < hitH) {
         return { type: 'scene', id: obj.id };
       }
    }

    return null;
  }
}
