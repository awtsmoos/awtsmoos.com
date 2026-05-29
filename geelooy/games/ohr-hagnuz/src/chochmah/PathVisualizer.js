/**
 * B"H
 * PathVisualizer.js
 * Shows path preview when clicking to move
 * Renders dashed lines, waypoints, and destination markers
 */
export class PathVisualizer {
  static waypoints = [];
  static destinationMarker = { x: 0, y: 0, visible: false };
  static blockedPath = { x: 0, y: 0, visible: false };
  
  static setPath(path) {
    this.waypoints = path ? [...path] : [];
    this.destinationMarker.visible = this.waypoints.length > 0;
    if (this.destinationMarker.visible) {
      const last = this.waypoints[this.waypoints.length - 1];
      this.destinationMarker.x = last.x * 32;
      this.destinationMarker.y = last.y * 32;
    }
  }
  
  static showBlocked(x, y) {
    this.blockedPath.x = x;
    this.blockedPath.y = y;
    this.blockedPath.visible = true;
    setTimeout(() => {
      this.blockedPath.visible = false;
    }, 500);
  }
  
  static clear() {
    this.waypoints = [];
    this.destinationMarker.visible = false;
    this.blockedPath.visible = false;
  }
  
  static draw(ctx, tick) {
    // Draw waypoint dots
    this.waypoints.forEach((wp, i) => {
      ctx.save();
      ctx.globalAlpha = 0.5 + Math.sin(tick * 0.2 + i * 0.5) * 0.3;
      ctx.fillStyle = '#4fc3f7';
      ctx.beginPath();
      ctx.arc(wp.x * 32 + 16, wp.y * 32 + 16, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
    
    // Draw dashed path line
    if (this.waypoints.length > 1) {
      ctx.save();
      ctx.strokeStyle = '#4fc3f7';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 8]);
      ctx.lineDashOffset = -tick * 0.5; // Animated dash
      ctx.globalAlpha = 0.6;
      
      ctx.beginPath();
      const start = this.waypoints[0];
      ctx.moveTo(start.x * 32 + 16, start.y * 32 + 16);
      
      for (let i = 1; i < this.waypoints.length; i++) {
        const wp = this.waypoints[i];
        ctx.lineTo(wp.x * 32 + 16, wp.y * 32 + 16);
      }
      ctx.stroke();
      ctx.restore();
    }
    
    // Draw destination marker (pulsing circle)
    if (this.destinationMarker.visible) {
      const pulse = Math.sin(tick * 0.15) * 0.5 + 0.5;
      const size = 12 + pulse * 6;
      
      ctx.save();
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 3;
      ctx.globalAlpha = 0.7 + pulse * 0.3;
      
      ctx.beginPath();
      ctx.arc(
        this.destinationMarker.x + 16,
        this.destinationMarker.y + 16,
        size,
        0,
        Math.PI * 2
      );
      ctx.stroke();
      
      // Inner glow
      const gradient = ctx.createRadialGradient(
        this.destinationMarker.x + 16,
        this.destinationMarker.y + 16,
        0,
        this.destinationMarker.x + 16,
        this.destinationMarker.y + 16,
        size
      );
      gradient.addColorStop(0, 'rgba(255, 215, 0, 0.4)');
      gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.fill();
      
      ctx.restore();
    }
    
    // Draw blocked indicator (red X)
    if (this.blockedPath.visible) {
      ctx.save();
      ctx.strokeStyle = '#ff4444';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.globalAlpha = 0.8;
      
      const bx = this.blockedPath.x + 16;
      const by = this.blockedPath.y + 16;
      const s = 10;
      
      ctx.beginPath();
      ctx.moveTo(bx - s, by - s);
      ctx.lineTo(bx + s, by + s);
      ctx.moveTo(bx + s, by - s);
      ctx.lineTo(bx - s, by + s);
      ctx.stroke();
      
      ctx.restore();
    }
  }
}