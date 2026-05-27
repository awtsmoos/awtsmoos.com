// B"H
(function(root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else {
    root.Merkava = root.Merkava || {};
    root.Merkava.VirtualImagePaintResolver = factory().VirtualImagePaintResolver;
  }
})(typeof self !== 'undefined' ? self : this, function() {
  /**
   * Chapter 39: Gradients descend like ordered lightning.
   *
   * Images, background images, and CSS gradients are converted into executor
   * paint intentions. The C host should only draw the requested op; it should
   * never parse url(), gradient(), repeat, size, or object-fit by itself.
   */
  class VirtualImagePaintResolver {
    imageElement(element, rect, style = {}) {
      const src = cleanUrl(element?.getAttribute?.('src') || '');
      return this.textureOp('paintImageTexture', src, rect, style, {
        alt: element?.getAttribute?.('alt') || '',
        objectFit: style['object-fit'] || 'fill',
        objectPosition: style['object-position'] || '50% 50%'
      });
    }

    backgroundLayers(style = {}, rect = {}) {
      return splitLayers(style['background-image']).map((source, layer) => {
        if (isGradient(source)) return this.gradientOp(source, rect, style, layer);
        const src = cleanUrl(source);
        if (!src || src === 'none') return null;
        return this.textureOp('paintBackgroundImage', src, rect, style, {
          layer,
          repeat: layerValue(style['background-repeat'], layer, 'repeat'),
          size: layerValue(style['background-size'], layer, 'auto'),
          position: layerValue(style['background-position'], layer, '0% 0%')
        });
      }).filter(Boolean);
    }

    gradientOp(source, rect, style, layer) {
      return {
        op: 'paintGradient', gradient: String(source), layer,
        x: rect.x, y: rect.y, width: rect.width, height: rect.height,
        alpha: opacity(style.opacity), kind: source.trim().split('(')[0]
      };
    }

    textureOp(op, src, rect, style, extra = {}) {
      const fit = resolveFit(extra.objectFit || extra.size, rect.width, rect.height);
      return { op, src, x: rect.x, y: rect.y, width: rect.width, height: rect.height, alpha: opacity(style.opacity), fit, ...extra };
    }
  }

  function splitLayers(value) {
    const text = String(value || '').trim();
    if (!text || text === 'none') return [];
    return text.split(/,(?![^()]*\))/).map(x => x.trim()).filter(Boolean);
  }

  function cleanUrl(value) { return String(value || '').trim().replace(/^url\((.*)\)$/i, '$1').replace(/^["']|["']$/g, ''); }
  function isGradient(value) { return /^(linear|radial|conic|repeating-linear|repeating-radial)-gradient\(/i.test(String(value || '').trim()); }

  function layerValue(value, index, fallback) {
    const parts = String(value || '').split(/,(?![^()]*\))/).map(x => x.trim()).filter(Boolean);
    return parts[index] || parts[0] || fallback;
  }

  function resolveFit(value, width, height) {
    const mode = String(value || 'fill').trim();
    return { mode, u0: 0, v0: 0, u1: 1, v1: 1, targetWidth: width, targetHeight: height };
  }

  function opacity(value) {
    const n = Number.parseFloat(String(value ?? '1'));
    return Number.isFinite(n) ? Math.max(0, Math.min(1, n)) : 1;
  }

  return { VirtualImagePaintResolver };
});
