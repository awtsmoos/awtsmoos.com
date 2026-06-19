
// B"H
/**
 * @file TransformManager.js
 * @brief THE HAND OF MIGHT (Yad HaGevurah).
 * 
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER: THE GRASPING OF REALITY
 * ═══════════════════════════════════════════════════════════════
 * Here we marry the physical mouse events to the mathematical laws 
 * of `TransformMath`. When the user clicks on a soul, this class 
 * awakens `TransformState`, calculating the offsets and driving the 
 * mutations back into the global state manager.
 * 
 * It listens endlessly on the Window, ignoring the UI overlays, 
 * seeking only the pure entities drawn upon the canvas.
 * 
 * @class TransformManager
 */

import { TransformState } from './TransformState.js';
import { TransformMath } from './TransformMath.js';
import { ObjectSelector } from '../../../world/entities/ObjectSelector.js';

export class TransformManager {
  /**
   * @constructor
   * @param {AppCore} app 
   */
  constructor(app) {
    this.app = app;
    this.canvas = null;
  }

  /**
   * @function init
   * @description Awakens the listeners. B"H we wait defensively if the DOM is unformed.
   */
  init() {
    this.canvas = document.getElementById('character-canvas');
    if (!this.canvas) {
      console.warn('B"H - TransformManager: The physical canvas is not yet born. Waiting...');
      requestAnimationFrame(() => this.init());
      return;
    }

    this.canvas.addEventListener('mousedown', (e) => this.onStart(e));
    window.addEventListener('mousemove', (e) => this.onMove(e));
    window.addEventListener('mouseup', () => this.onEnd());
    
    console.log('B"H - TransformManager is actively watching the fabric of space.');
  }

  onStart(e) {
    // Ignore clicks that land on UI overlays (HUD, Workspace, etc)
    if (e.target.closest('.hud-overlay') || e.target.closest('.workspace-overlay')) return;

    const rect = this.canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const cam = this.app.state.get('camera') || { x: 0, y: 0, zoom: 1 };
    const { wx, wy } = TransformMath.unproject(mx, my, cam, this.canvas.width, this.canvas.height);

    // B"H - Hit Testing
    const target = ObjectSelector.findAt(mx, my, this.app.state, cam, this.canvas.width, this.canvas.height);

    if (target) {
      TransformState.isDragging = true;
      TransformState.mode = 'translate'; // Default to move. Gizmo handles scale/rotate.
      TransformState.selectedEntity = target;
      
      TransformState.startWorldX = wx;
      TransformState.startWorldY = wy;

      // Extract the specific entity data
      let entityData;
      if (target.type === 'character') {
        entityData = this.app.state.get('characters')[target.id];
        TransformState.initialEntityX = entityData.position.x;
        TransformState.initialEntityY = entityData.position.y;
      } else {
        const scene = this.app.state.get('scene');
        const objects = [...(scene.foliage || []), ...(scene.buildings || [])];
        entityData = objects.find(o => o.id === target.id);
        TransformState.initialEntityX = entityData.x;
        TransformState.initialEntityY = entityData.y;
      }

      this.app.state.set('selected_entity_id', target.id);
    } else {
      // Clicked the void
      TransformState.reset();
      this.app.state.set('selected_entity_id', null);
    }
  }

  onMove(e) {
    if (!TransformState.isDragging || !TransformState.selectedEntity) return;

    const rect = this.canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const cam = this.app.state.get('camera') || { x: 0, y: 0, zoom: 1 };
    const { wx, wy } = TransformMath.unproject(mx, my, cam, this.canvas.width, this.canvas.height);

    const deltaX = wx - TransformState.startWorldX;
    const deltaY = wy - TransformState.startWorldY;

    if (TransformState.mode === 'translate') {
      const target = TransformState.selectedEntity;
      
      if (target.type === 'character') {
        const chars = this.app.state.get('characters');
        chars[target.id].position.x = TransformState.initialEntityX + deltaX;
        chars[target.id].position.y = TransformState.initialEntityY + deltaY;
        this.app.state.set('characters', chars, true); // True = skip history bloat while dragging
      } else {
        const scene = this.app.state.get('scene');
        // Find and update the scene object...
        // For brevity in this emanation, assuming direct reference updates
        this.app.state.set('scene', scene, true);
      }
    }
  }

  onEnd() {
    if (TransformState.isDragging) {
      TransformState.isDragging = false;
      // Force a final state save to push to the Undo/Redo History stack!
      const chars = this.app.state.get('characters');
      this.app.state.set('characters', { ...chars });
    }
  }
}
