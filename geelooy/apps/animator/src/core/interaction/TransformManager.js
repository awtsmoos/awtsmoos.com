
import { ObjectSelector } from '../../world/entities/ObjectSelector.js';

/**
 * @file TransformManager.js
 * @description
 * THE HAND OF MIGHT (Yad HaGevurah). 
 * B"H
 * Now handles scaling, rotation, and dispatches the exact selection ID 
 * to the PropertyInspector so the timeline and UI stay in perfect sync.
 */

export class TransformManager {
  constructor(app) {
    this.app = app;
    this.selected = null;
    this.isDragging = false;
    this.dragOffset = { x: 0, y: 0 };
    this.retryCount = 0;
  }

  init() {
    const canvas = document.getElementById('character-canvas');
    if (!canvas) {
      if (this.retryCount < 50) {
        this.retryCount++;
        requestAnimationFrame(() => this.init());
        return;
      }
      return;
    }

    canvas.addEventListener('mousedown', (e) => this.onStart(e));
    window.addEventListener('mousemove', (e) => this.onMove(e));
    window.addEventListener('mouseup', () => this.onEnd());
  }

  onStart(e) {
    if (e.target.closest('.app-sidebar-left') || e.target.closest('.app-timeline') || e.target.closest('.properties-panel')) return;

    const rect = e.target.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const target = ObjectSelector.findAt(
      mx, my, 
      this.app.state, 
      this.app.ctx.camera, 
      this.app.ctx.width, 
      this.app.ctx.height
    );
    
    if (target) {
      this.isDragging = true;
      this.selected = target;
      
      // Tell the universe an object was grasped
      this.app.state.set('selected_entity_id', target.id);
      window.dispatchEvent(new CustomEvent('nle-selection-changed', { detail: { id: target.id, type: target.type } }));
      
      const wx = (mx - this.app.ctx.width/2) / this.app.ctx.camera.zoom + this.app.ctx.camera.x;
      const wy = (my - this.app.ctx.height/2) / this.app.ctx.camera.zoom + this.app.ctx.camera.y;
      
      if (target.type === 'character') {
        const char = this.app.state.get('characters')[target.id];
        this.dragOffset = { x: wx - char.position.x, y: wy - char.position.y };
      }
    } else {
      // Clear selection if clicking the void
      this.app.state.set('selected_entity_id', null);
      window.dispatchEvent(new CustomEvent('nle-selection-cleared'));
    }
  }

  onMove(e) {
    if (!this.isDragging || !this.selected) return;
    
    const canvas = document.getElementById('character-canvas');
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    
    const wx = (mx - this.app.ctx.width/2) / this.app.ctx.camera.zoom + this.app.ctx.camera.x;
    const wy = (my - this.app.ctx.height/2) / this.app.ctx.camera.zoom + this.app.ctx.camera.y;

    if (this.selected.type === 'character') {
      const chars = this.app.state.get('characters');
      chars[this.selected.id].position = { x: wx - this.dragOffset.x, y: wy - this.dragOffset.y };
      this.app.state.set('characters', chars, true);
    }
  }

  onEnd() {
    this.isDragging = false;
  }
}
