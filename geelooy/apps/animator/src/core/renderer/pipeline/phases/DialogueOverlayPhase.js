// B"H

/**
 * @file DialogueOverlayPhase.js
 * @description
 * Chapter Twenty-Seven: The duplicate speech card fell silent.
 *
 * The NLE director bar is now the single caption surface. Drawing a second
 * white bubble in the sky made every shot look like debug UI and stole focus
 * from faces. This phase remains as a stable no-op vessel so the render graph
 * contract does not break.
 */
export class DialogueOverlayPhase {
  /**
   * Builds no separate dialogue overlay.
   *
   * @returns {null} No overlay; captions live in the director bar.
   */
  static build() {
    return null;
  }
}
