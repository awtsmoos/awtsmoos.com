// B"H

/**
 * @file LineArtStyle.js
 * @description
 * Selective cartoon line art: outer silhouette stronger, inner seams softer,
 * no block borders around people.
 */
export class LineArtStyle {
  /**
   * Returns line style values.
   *
   * @param {Object} data - Character data.
   * @returns {Object} Style.
   */
  static forCharacter(data = {}) {
    const style = data.lineStyle || 'softCartoon';
    const map = {
      softCartoon: {
        outer: 3,
        inner: 1.4,
        seam: 1.8,
        far: 1.2,
        alphaFar: 0.62,
        stroke: '#070707',
        softStroke: 'rgba(0,0,0,0.42)'
      },
      boldCartoon: {
        outer: 4,
        inner: 2,
        seam: 2.2,
        far: 1.6,
        alphaFar: 0.7,
        stroke: '#050505',
        softStroke: 'rgba(0,0,0,0.52)'
      }
    };

    return map[style] || map.softCartoon;
  }

  /**
   * Outer path style.
   *
   * @param {Object} data - Character data.
   * @param {Object} fill - Fill color object/string.
   * @returns {Object} Style.
   */
  static outer(data, fill) {
    const s = this.forCharacter(data);
    return { fill, stroke: s.stroke, lineWidth: s.outer, lineJoin: 'round', lineCap: 'round' };
  }

  /**
   * Inner line style.
   *
   * @param {Object} data - Character data.
   * @param {string} stroke - Optional stroke.
   * @returns {Object} Style.
   */
  static inner(data, stroke = null) {
    const s = this.forCharacter(data);
    return { stroke: stroke || s.softStroke, lineWidth: s.inner, lineCap: 'round', lineJoin: 'round' };
  }

  /**
   * Far-side style.
   *
   * @param {Object} data - Character data.
   * @param {string} fill - Fill.
   * @returns {Object} Style.
   */
  static far(data, fill) {
    const s = this.forCharacter(data);
    return { fill, stroke: s.stroke, lineWidth: s.far, lineJoin: 'round', lineCap: 'round', globalAlpha: s.alphaFar };
  }
}