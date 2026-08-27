export class Renderer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.width = this.canvas.width;
    this.height = this.canvas.height;
  }

  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  // Helper to draw a path with stroke and fill
  drawPath(points, fillColor, strokeColor = '#000', lineWidth = 3) {
    if (!points || points.length === 0) return;

    this.ctx.beginPath();
    this.ctx.moveTo(points[0].x, points[0].y);
    
    for (let i = 1; i < points.length; i++) {
      if (points[i].cx1 && points[i].cy1) {
        // Bezier curve
        this.ctx.bezierCurveTo(
          points[i].cx1, points[i].cy1,
          points[i].cx2, points[i].cy2,
          points[i].x, points[i].y
        );
      } else if (points[i].cx && points[i].cy) {
        // Quadratic curve
        this.ctx.quadraticCurveTo(points[i].cx, points[i].cy, points[i].x, points[i].y);
      } else {
        this.ctx.lineTo(points[i].x, points[i].y);
      }
    }

    this.ctx.closePath();
    
    if (fillColor) {
      this.ctx.fillStyle = fillColor;
      this.ctx.fill();
    }
    
    if (strokeColor) {
      this.ctx.strokeStyle = strokeColor;
      this.ctx.lineWidth = lineWidth;
      this.ctx.lineJoin = 'round';
      this.ctx.stroke();
    }
  }

  drawCircle(x, y, radius, fillColor, strokeColor = '#000', lineWidth = 3) {
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    
    if (fillColor) {
      this.ctx.fillStyle = fillColor;
      this.ctx.fill();
    }
    
    if (strokeColor) {
      this.ctx.strokeStyle = strokeColor;
      this.ctx.lineWidth = lineWidth;
      this.ctx.stroke();
    }
  }

  drawEllipse(x, y, radiusX, radiusY, rotation, fillColor, strokeColor = '#000', lineWidth = 3) {
    this.ctx.beginPath();
    this.ctx.ellipse(x, y, radiusX, radiusY, rotation, 0, Math.PI * 2);
    
    if (fillColor) {
      this.ctx.fillStyle = fillColor;
      this.ctx.fill();
    }
    
    if (strokeColor) {
      this.ctx.strokeStyle = strokeColor;
      this.ctx.lineWidth = lineWidth;
      this.ctx.stroke();
    }
  }
}
