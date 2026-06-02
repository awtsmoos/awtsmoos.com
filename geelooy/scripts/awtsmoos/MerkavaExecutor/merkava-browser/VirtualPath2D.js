// B"H
(function(root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else { root.Merkava = root.Merkava || {}; root.Merkava.VirtualPath2D = factory().VirtualPath2D; }
})(typeof self !== 'undefined' ? self : this, function() {
  /**
   * B"H
   * Path2D is a reusable geometric scroll. Canvas2D can replay it into its own
   * current path, preserving the same command ledger as direct drawing calls.
   */
  class VirtualPath2D {
    constructor(source = null) {
      this.commands = [];
      if (source instanceof VirtualPath2D) this.commands = source.commands.map(item => item.slice());
      else if (typeof source === 'string' && source.trim()) this.commands.push(['svgPath', source]);
    }
    addPath(path) { if (path?.commands) this.commands.push(...path.commands.map(item => item.slice())); }
    closePath() { this.commands.push(['closePath']); }
    moveTo(x, y) { this.commands.push(['moveTo', x, y]); }
    lineTo(x, y) { this.commands.push(['lineTo', x, y]); }
    rect(x, y, width, height) { this.commands.push(['rect', x, y, width, height]); }
    roundRect(x, y, width, height, radii = 0) { this.commands.push(['roundRect', x, y, width, height, radii]); }
    arc(x, y, radius, startAngle, endAngle, anticlockwise = false) { this.commands.push(['arc', x, y, radius, startAngle, endAngle, anticlockwise]); }
    ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise = false) { this.commands.push(['ellipse', x, y, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise]); }
    quadraticCurveTo(cpx, cpy, x, y) { this.commands.push(['quadraticCurveTo', cpx, cpy, x, y]); }
    bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y) { this.commands.push(['bezierCurveTo', cp1x, cp1y, cp2x, cp2y, x, y]); }
  }
  return { VirtualPath2D };
});
