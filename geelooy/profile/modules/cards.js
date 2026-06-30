// B"H
/**
 * @module ProfileCards
 * @description
 * Chapter 22: The Awtsmoos carves profile data into accessible cards. The
 * module creates nodes only; event binding belongs elsewhere.
 *
 * @inputs Alias and Heichel objects from profile state/API.
 * @outputs HTMLElement card vessels.
 * @failureModes Missing IDs fall back to safe placeholder text.
 */
import { cleanText } from "./dom.js";

export function emptyCard(message, tone = "plain") {
  const card = document.createElement("article");
  card.className = `social-empty-card ${tone === "error" ? "error" : ""}`.trim();
  card.textContent = message;
  return card;
}

export function aliasAvatar(alias) {
  return cleanText(alias.name || alias.id || "A").slice(0, 1).toUpperCase();
}

export function aliasCard(alias) {
  const id = cleanText(alias.id);
  const params = new URLSearchParams({ alias: id, action: "update" });
  const card = document.createElement("article");
  card.className = `social-alias-card ${alias.default ? "default" : ""}`.trim();
  card.innerHTML = `
    <div class="alias-avatar" aria-hidden="true">${aliasAvatar(alias)}</div>
    <div class="alias-copy">
      <a class="alias-id" href="/@${encodeURIComponent(id)}">@${id}</a>
      <h3>${cleanText(alias.name || id)}</h3>
      <p>${cleanText(alias.description || "A quiet identity awaiting a voice.")}</p>
      <div class="alias-card-actions">
        <a href="./alias-manage?${params}">Edit Profile</a>
        <a href="/email?alias=${encodeURIComponent(id)}">Mail</a>
        <button type="button" data-default-alias="${id}" aria-pressed="${alias.default ? "true" : "false"}">${alias.default ? "Default" : "Make Default"}</button>
      </div>
    </div>`;
  return card;
}

export function heichelCard(heichel, aliasId) {
  const id = cleanText(heichel.id || heichel.heichelId || heichel.inputId, "unknown");
  const card = document.createElement("article");
  card.className = "social-heichel-card";
  card.innerHTML = `
    <div class="heichel-card-banner" aria-hidden="true"></div>
    <div class="heichel-card-body">
      <div class="heichel-seal-small" aria-hidden="true">♛</div>
      <div>
        <h3>${cleanText(heichel.name || id)}</h3>
        <p>${cleanText(heichel.description || "A sacred social space.")}</p>
        <small>Owner: @${cleanText(aliasId)}</small>
      </div>
      <a href="/heichelos/${encodeURIComponent(id)}/?editingAlias=${encodeURIComponent(aliasId)}">Open</a>
    </div>`;
  return card;
}
