/**
 * B"H
 * ════════════════════════════════════════════════════════════════════════
 *   THE SCROLLS OF SPEECH — DialogueTrees.js
 *   ──────────────────────────────────────────
 *   Point 3 of the 32 Emanations.
 *   Complex branching dialogue paths for the Mitzvah World.
 * ════════════════════════════════════════════════════════════════════════
 */

export const DIALOGUE_TREES = {
  welcome_chossid: {
    startNode: 'greeting',
    nodes: {
      greeting: {
        text: "B\"H! Welcome to the Mitzvah World, my friend. Have you come to study or to act?",
        options: [
          { text: "I wish to study.", next: "study_path" },
          { text: "I am ready for action!", next: "action_path" }
        ]
      },
      study_path: {
        text: "The Beis HaKnesses is always open. Go inside and find a Gemara.",
        options: [{ text: "Thank you.", next: null }]
      },
      action_path: {
        text: "Excellent! The world needs your holy sparks. Go speak to the builder near the skyscraper.",
        options: [{ text: "On my way!", next: null }]
      }
    }
  }
};
