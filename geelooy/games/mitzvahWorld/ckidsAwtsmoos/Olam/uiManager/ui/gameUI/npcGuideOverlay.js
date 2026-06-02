// B"H
/**
 * @file npcGuideOverlay.js
 * @description
 * Chapter 139: Compatibility shim only.
 *
 * Future AI: the real NPC guide UI is owned by
 * `Olam/worker/handlers/ui.js::openNpcChallengeOverlay`. Do not add competing
 * CSS or another panel here; duplicate guide CSS caused the clipped left-edge
 * mobile card. This component now only removes stale styles/panels if an old
 * path tries to awaken it.
 */
function purgeLegacyNpcPanels() {
  document.getElementById("npc-guide-overlay-style")?.remove();
  document.querySelectorAll(".npcChallengeOverlay,.npc-challenge-overlay,.challengeOverlay,.premium-dialogue-container,[shaym='dialogue-vessel']").forEach(el => el.remove());
}

export default {
  shaym: "openNpcChallengeOverlay",
  className: "hidden",
  ready() { purgeLegacyNpcPanels(); },
  on: { awtsmoosRevealed() { purgeLegacyNpcPanels(); } }
};
