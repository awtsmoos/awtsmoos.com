/* B”H */
export class TransformControls {
  constructor(state) {
    this.state = state;
    this.selectedObject = null;
  }

  select(obj) {
    this.selectedObject = obj;
    this.state.set('selectedObject', obj);
  }

  update(deltaX, deltaY, mode = 'translate') {
    if (!this.selectedObject) return;
    
    const cam = this.state.get('camera');
    const zoom = cam.zoom || 1;
    const item = this.selectedObject.item;
    
    let parallax = 1.0;
    if (this.selectedObject.type === 'building') parallax = 0.7;
    if (this.selectedObject.type === 'mountain') parallax = 0.2;

    if (mode === 'translate') {
      item.x += deltaX / (zoom * parallax);
      item.y += deltaY / (zoom * parallax);
    } else if (mode === 'scale') {
      item.w = (item.w || 0) + deltaX / zoom;
      item.h = (item.h || 0) + deltaY / zoom;
      if (item.size !== undefined) item.size += deltaX / zoom;
    }
    
    this.state.notify('scene');
  }
}
