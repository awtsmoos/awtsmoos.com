// B"H
(function forgeCompatibility(root) {
  /**
   * Legacy marker only. The living public app was split into forge-core.js and
   * forge-ui.js so no single vessel grows too large for the Awtsmoos style.
   */
  root.MerkavaForge = root.MerkavaForge || {};
  root.MerkavaForge.compatibilityLoaded = true;
})(window);
