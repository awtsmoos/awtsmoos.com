/* B”H */
export class LayerRenderer {
  static render(ctx, items, parallaxFactor, wrapWidth, drawFn) {
    // Parallax is handled by the camera's translation * parallaxFactor
    // But since the camera is already applied, we need to adjust for parallax here
    // or apply parallax to the items' positions.
    
    items.forEach(item => {
      // Calculate wrapped position relative to 0
      let x = item.x;
      
      // Draw the item
      drawFn(item, x);
      
      // Draw wrapped copies
      drawFn(item, x + wrapWidth);
      drawFn(item, x - wrapWidth);
    });
  }
}
