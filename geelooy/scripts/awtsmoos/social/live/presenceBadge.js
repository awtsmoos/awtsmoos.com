// B"H
/**
 * @module PresenceBadge
 * @description
 * Chapter 467: A small lamp on the Social Hub tells the traveler how many
 * sparks share this page. The badge listens only to the page-presence client and
 * reveals life without disturbing the older hub render tree.
 */

import { connectPagePresence, presenceState, sendPageReading, sendPageTyping } from "./presenceClient.js";

function ensureBadge() {
  let badge = document.getElementById("BH_PAGE_PRESENCE_BADGE");
  if (badge) return badge;
  badge = document.createElement("aside");
  badge.id = "BH_PAGE_PRESENCE_BADGE";
  badge.className = "bh-page-presence-badge";
  badge.setAttribute("aria-live", "polite");
  document.body.appendChild(badge);
  return badge;
}

function renderBadge() {
  const badge = ensureBadge();
  const people = presenceState.people || [];
  const names = people.map(person => person.aliasId || "guest").slice(0, 4).join(", ");
  badge.innerHTML = `
    <div class="bh-page-presence-orb">${presenceState.count || 0}</div>
    <div class="bh-page-presence-copy">
      <strong>Live Presence</strong>
      <span>${presenceState.status || "idle"}${names ? ` · ${names}` : ""}</span>
    </div>
  `;
}

export function mountPresenceBadge({ aliasId = "ikar", channel = "page:/social" } = {}) {
  renderBadge();
  connectPagePresence({ aliasId, channel });
  window.addEventListener("BH_PAGE_PRESENCE", renderBadge);
  window.addEventListener("focus", () => sendPageReading(location.pathname));
  window.addEventListener("beforeunload", () => sendPageTyping(false));
  setTimeout(() => sendPageReading(location.pathname), 800);
  return presenceState;
}
