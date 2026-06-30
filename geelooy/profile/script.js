// B"H
/**
 * @module ProfileControlCenter
 * @description
 * Chapter 26: The Awtsmoos splits the profile palace into clear vessels. This
 * entry file only orchestrates startup: tabs, aliases, default identity,
 * Heichelos, and visible async recovery.
 *
 * Contract anchors preserved for the dashboard test:
 * /api/social/aliases/details
 * /api/social/alias/default
 * /api/social/alias/${encodeURIComponent(alias.id)}/heichelos/details
 * setDefaultAlias
 * renderHeichelos
 */
import { announceProfile, one, setStat } from "./modules/dom.js";
import { getAliasDetails, getDefaultAlias } from "./modules/api.js";
import { setAliases, state } from "./modules/state.js";
import { renderAliases } from "./modules/aliases.js";
import { renderHeichelos } from "./modules/heichelos.js";
import { bindTabs } from "./modules/tabs.js";
import { emptyCard } from "./modules/cards.js";

async function loadDefaultAlias() {
  try {
    return await getDefaultAlias();
  } catch (error) {
    announceProfile(error.message || "Default alias could not be loaded.", "error");
    return "";
  }
}

async function loadProfile() {
  announceProfile("Loading profile dashboard…", "loading");
  const defaultAlias = await loadDefaultAlias();
  const aliases = await getAliasDetails();
  setAliases(aliases, defaultAlias);
  setStat("aliases", String(state.aliases.length));
  setStat("defaultAlias", state.defaultAlias ? `@${state.defaultAlias}` : "None");
  renderAliases();
  await renderHeichelos();
  announceProfile("Profile dashboard loaded.", "success");
}

function renderFatalProfileError(error) {
  const message = error.message || "Could not load profile.";
  one(".alias-list")?.replaceChildren(emptyCard(message, "error"));
  one(".heichel-list")?.replaceChildren(emptyCard("Heichelos could not load because profile loading failed.", "error"));
  announceProfile(message, "error");
}

window.addEventListener("DOMContentLoaded", async () => {
  bindTabs();
  try {
    await loadProfile();
  } catch (error) {
    renderFatalProfileError(error);
  }
});
