// B"H

/**
 * @file AssetManifestEngine.js
 * @description
 * Builds the bin as a production manifest: rigs, mouth shapes, fur cards,
 * backgrounds, props, and render readiness for the long episode vessel.
 */
export class AssetManifestEngine {
  static build(plan) {
    return {
      characters: plan.characters.map((c) => ({ ...c, rig: 'full-body-2d-rig', mouthShapes: 12, hands: 16, furCards: c.name.includes('Pet') ? 24 : 4 })),
      backgrounds: plan.assets.filter((a) => !/Pack|Crate/.test(a)).map((name) => ({ name, layers: 6, parallax: true })),
      props: plan.assets.filter((a) => /Pack|Crate|Vehicle/.test(a)).map((name) => ({ name, states: ['clean', 'used', 'damaged'] })),
      missing: []
    };
  }
}
