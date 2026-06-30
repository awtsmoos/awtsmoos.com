// B"H
/**
 * @module ProfileAliases
 * @description
 * Chapter 23: The Awtsmoos lets identity buttons tell the truth while saving.
 * This renderer binds default-alias actions with loading, disabled, failure,
 * and announced recovery states.
 */
import { announceProfile, one, replaceWith, setStat } from "./dom.js";
import { aliasCard, emptyCard } from "./cards.js";
import { setDefaultAlias } from "./api.js";
import { setDefaultAliasState, state } from "./state.js";

async function saveDefaultAlias(aliasId, button) {
  if (!aliasId || state.defaultAlias === aliasId) return;
  const original = button.textContent;
  button.disabled = true;
  button.textContent = "Saving…";
  announceProfile(`Saving @${aliasId} as default alias.`, "loading");
  try {
    await setDefaultAlias(aliasId);
    setDefaultAliasState(aliasId);
    dispatchEvent(new CustomEvent("awtsmoosAliasChange", { detail: { id: aliasId } }));
    announceProfile(`@${aliasId} is now your default alias.`, "success");
    renderAliases();
  } catch (error) {
    button.disabled = false;
    button.textContent = original;
    announceProfile(error.message || "Default alias could not be saved.", "error");
  }
}

export function renderAliases() {
  const list = one(".alias-list");
  if (!list) return;
  if (!state.aliases.length) {
    replaceWith(list, emptyCard("No aliases yet. Create your first identity and enter the network."));
    return;
  }
  replaceWith(list, ...state.aliases.map(aliasCard));
  list.querySelectorAll("[data-default-alias]").forEach(button => {
    button.addEventListener("click", () => saveDefaultAlias(button.dataset.defaultAlias, button));
  });
  setStat("defaultAlias", state.defaultAlias ? `@${state.defaultAlias}` : "None");
}
