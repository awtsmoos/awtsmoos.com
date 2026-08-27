// B"H

/**
 * @file SpeechBubbleFactory.js
 * @description
 * Actor-plane speech is intentionally disabled now. Dialogue is rendered by
 * DialogueOverlayPhase in screen space so text never lands on a character head.
 */
export class SpeechBubbleFactory {
  /**
   * Returns no actor-plane speech bubble.
   *
   * @returns {null} No node.
   */
  static build() {
    return null;
  }
}